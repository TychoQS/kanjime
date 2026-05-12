import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";

import { ensureDirectory, PATHS, calculateSha256, writeBinaryFile, writeJsonFile } from "./file-system.mjs";
import { DATA_SOURCE_DEFINITIONS } from "./source-manifest.mjs";

/**
 * Writes a status line to stdout.
 *
 * @param {string} message User-facing status line.
 * @returns {void}
 */
function writeStatus(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Resolves the effective download URL for a source entry.
 *
 * @param {typeof DATA_SOURCE_DEFINITIONS[number]} sourceDefinition Source definition.
 * @returns {Promise<{ downloadUrls: string[]; resolvedFileName: string; upstreamVersion: string | null }>}
 */
async function resolveDownloadTarget(sourceDefinition) {
  if (sourceDefinition.sourceType === "direct") {
    return {
      downloadUrls: [sourceDefinition.url, ...(sourceDefinition.fallbackUrls ?? [])],
      resolvedFileName: sourceDefinition.compressedFileName,
      upstreamVersion: null
    };
  }

  const releaseResponse = await fetch(sourceDefinition.releaseApiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "KanjiMe-data-pipeline"
    }
  });

  if (!releaseResponse.ok) {
    throw new Error(`Unable to resolve the latest release for ${sourceDefinition.displayName}.`);
  }

  const release = /** @type {{ tag_name?: string; assets?: Array<{ name?: string; browser_download_url?: string }> }} */ (
    await releaseResponse.json()
  );

  const assetPattern = new RegExp(sourceDefinition.assetFilePattern, "i");
  const matchingAsset = (release.assets ?? []).find((asset) => {
    return typeof asset.name === "string" && typeof asset.browser_download_url === "string" && assetPattern.test(asset.name);
  });

  if (!matchingAsset?.browser_download_url || !matchingAsset.name) {
    throw new Error(`Unable to find a matching release asset for ${sourceDefinition.displayName}.`);
  }

  return {
    downloadUrls: [matchingAsset.browser_download_url],
    resolvedFileName: matchingAsset.name,
    upstreamVersion: release.tag_name ?? null
  };
}

/**
 * Resolves the effective download URL for a source entry.
 *
 * @param {typeof DATA_SOURCE_DEFINITIONS[number]} sourceDefinition Source definition.
 * @returns {Promise<{ downloadUrls: string[]; resolvedFileName: string | null; upstreamVersion: string | null }>}
 */
async function resolveSourceTarget(sourceDefinition) {
  if (sourceDefinition.sourceType === "manual") {
    return {
      downloadUrls: [sourceDefinition.url],
      resolvedFileName: null,
      upstreamVersion: sourceDefinition.upstreamVersion ?? null
    };
  }

  return resolveDownloadTarget(sourceDefinition);
}

/**
 * Downloads a remote file.
 *
 * @param {ReadonlyArray<string>} downloadUrls Source URLs ordered by priority.
 * @returns {Promise<{ downloadUrl: string; contents: Uint8Array }>}
 *
 * @pre downloadUrl is reachable over HTTPS.
 * @post The returned bytes contain the downloaded response body.
 */
async function downloadBinary(downloadUrls) {
  let lastError = null;

  for (const downloadUrl of downloadUrls) {
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          "User-Agent": "KanjiMe-data-pipeline"
        }
      });

      if (!response.ok) {
        throw new Error(`Unexpected HTTP status ${response.status}.`);
      }

      return {
        downloadUrl,
        contents: new Uint8Array(await response.arrayBuffer())
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to download any of the configured URLs. ${lastError instanceof Error ? lastError.message : "Unknown error."}`
  );
}

/**
 * Expands a downloaded payload when required.
 *
 * @param {Uint8Array} compressedContents Downloaded contents.
 * @param {"gzip" | "none"} compression Compression type.
 * @returns {Uint8Array}
 *
 * @post The returned payload is ready to be parsed by the build step.
 */
function expandContents(compressedContents, compression) {
  if (compression === "gzip") {
    return gunzipSync(compressedContents);
  }

  return compressedContents;
}

await ensureDirectory(PATHS.rawSourcesDirectory);
await ensureDirectory(PATHS.expandedSourcesDirectory);

const downloadManifestEntries = [];

for (const sourceDefinition of DATA_SOURCE_DEFINITIONS) {
  writeStatus(`Processing ${sourceDefinition.displayName}...`);

  const target = await resolveSourceTarget(sourceDefinition);
  let downloadedSource = null;
  let compressedContents = null;
  let expandedContents = null;
  let rawFilePath = null;
  let expandedFilePath = null;

  if (sourceDefinition.sourceType !== "manual") {
    downloadedSource = await downloadBinary(target.downloadUrls);
    compressedContents = downloadedSource.contents;
    expandedContents = expandContents(compressedContents, sourceDefinition.compression);

    rawFilePath = resolve(PATHS.rawSourcesDirectory, sourceDefinition.compressedFileName);
    expandedFilePath = resolve(PATHS.expandedSourcesDirectory, sourceDefinition.expandedFileName);

    await writeBinaryFile(rawFilePath, compressedContents);
    await writeBinaryFile(expandedFilePath, expandedContents);
  }

  downloadManifestEntries.push({
    id: sourceDefinition.id,
    displayName: sourceDefinition.displayName,
    homepage: sourceDefinition.homepage,
    attribution: sourceDefinition.attribution,
    license: sourceDefinition.license,
    downloadUrl: downloadedSource?.downloadUrl ?? target.downloadUrls[0],
    downloadedAt: downloadedSource ? new Date().toISOString() : null,
    upstreamVersion: target.upstreamVersion,
    ...(rawFilePath ? { compressedFileName: sourceDefinition.compressedFileName } : {}),
    ...(expandedFilePath ? { expandedFileName: sourceDefinition.expandedFileName } : {}),
    ...(rawFilePath ? { rawFilePath } : {}),
    ...(expandedFilePath ? { expandedFilePath } : {}),
    ...(compressedContents ? { compressedSha256: calculateSha256(compressedContents) } : {}),
    ...(expandedContents ? { expandedSha256: calculateSha256(expandedContents) } : {}),
    ...(compressedContents ? { compressedSizeBytes: compressedContents.byteLength } : {}),
    ...(expandedContents ? { expandedSizeBytes: expandedContents.byteLength } : {})
  });
}

await writeJsonFile(PATHS.downloadManifestFile, {
  generatedAt: new Date().toISOString(),
  sources: downloadManifestEntries
});

writeStatus("Downloaded and expanded all declared data sources.");
