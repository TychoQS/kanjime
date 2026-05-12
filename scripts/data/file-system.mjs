import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

/**
 * Shared paths for the data ingestion workflow.
 *
 * @inv All derived paths stay inside the repository root.
 */
export const PATHS = {
  projectRoot,
  cacheDirectory: resolve(projectRoot, ".cache", "data-sources"),
  rawSourcesDirectory: resolve(projectRoot, ".cache", "data-sources", "raw"),
  expandedSourcesDirectory: resolve(projectRoot, ".cache", "data-sources", "expanded"),
  publicDatabaseDirectory: resolve(projectRoot, "public", "assets", "database"),
  publicAttributionDirectory: resolve(projectRoot, "public", "assets", "attributions"),
  modelClassesFile: resolve(projectRoot, "public", "assets", "model", "classes.json"),
  downloadManifestFile: resolve(projectRoot, ".cache", "data-sources", "download-manifest.json"),
  packagedDatabaseFile: resolve(projectRoot, "public", "assets", "database", "kanji.sqlite"),
  packagedMetadataFile: resolve(projectRoot, "public", "assets", "database", "kanji.metadata.json"),
  packagedAttributionFile: resolve(projectRoot, "public", "assets", "attributions", "data-sources.json")
};

/**
 * Ensures that the parent directory of a file exists.
 *
 * @param {string} filePath Absolute file path.
 * @returns {Promise<void>}
 *
 * @pre filePath is an absolute path inside the repository.
 * @post The parent directory exists after the promise resolves.
 */
export async function ensureParentDirectory(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

/**
 * Ensures that a directory exists.
 *
 * @param {string} directoryPath Absolute directory path.
 * @returns {Promise<void>}
 *
 * @pre directoryPath is an absolute path inside the repository.
 * @post The directory exists after the promise resolves.
 */
export async function ensureDirectory(directoryPath) {
  await mkdir(directoryPath, { recursive: true });
}

/**
 * Reads a UTF-8 text file.
 *
 * @param {string} filePath Absolute file path.
 * @returns {Promise<string>}
 *
 * @pre filePath exists and is readable.
 * @post The returned string contains the file contents decoded as UTF-8.
 */
export async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

/**
 * Writes UTF-8 text to a file.
 *
 * @param {string} filePath Absolute file path.
 * @param {string} contents File contents.
 * @returns {Promise<void>}
 *
 * @pre filePath is writable within the repository.
 * @post The target file exists and contains the provided text.
 */
export async function writeTextFile(filePath, contents) {
  await ensureParentDirectory(filePath);
  await writeFile(filePath, contents, "utf8");
}

/**
 * Writes binary contents to a file.
 *
 * @param {string} filePath Absolute file path.
 * @param {Uint8Array} contents Binary contents.
 * @returns {Promise<void>}
 *
 * @pre filePath is writable within the repository.
 * @post The target file exists and contains the provided bytes.
 */
export async function writeBinaryFile(filePath, contents) {
  await ensureParentDirectory(filePath);
  await writeFile(filePath, contents);
}

/**
 * Reads and parses a JSON file.
 *
 * @template T
 * @param {string} filePath Absolute file path.
 * @returns {Promise<T>}
 *
 * @pre filePath exists and contains valid JSON text.
 * @post The parsed JSON value is returned.
 */
export async function readJsonFile(filePath) {
  return JSON.parse(await readTextFile(filePath));
}

/**
 * Serializes a value as formatted JSON and writes it to disk.
 *
 * @param {string} filePath Absolute file path.
 * @param {unknown} contents Serializable value.
 * @returns {Promise<void>}
 *
 * @pre filePath is writable within the repository.
 * @post The target file contains a formatted JSON representation of contents.
 */
export async function writeJsonFile(filePath, contents) {
  await writeTextFile(filePath, `${JSON.stringify(contents, null, 2)}\n`);
}

/**
 * Calculates the SHA-256 digest for a binary payload.
 *
 * @param {Uint8Array} contents Binary payload.
 * @returns {string}
 *
 * @post The returned string is the lowercase hexadecimal SHA-256 digest.
 */
export function calculateSha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

