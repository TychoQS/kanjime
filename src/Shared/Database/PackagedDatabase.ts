import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

import type { PackagedDatabaseMetadata } from "./Contracts/PackagedDatabaseMetadata";
import { DatabaseError } from "../AppErrors";

const PACKAGED_DATABASE_FILE_NAME = "kanji.sqlite";
const PACKAGED_METADATA_FILE_NAME = "kanji.metadata.json";
const NATIVE_PACKAGED_DATABASE_DIRECTORY = "databases";
const NATIVE_PACKAGED_DATABASE_PATH = `${NATIVE_PACKAGED_DATABASE_DIRECTORY}/${PACKAGED_DATABASE_FILE_NAME}`;
const NATIVE_PACKAGED_METADATA_PATH = `${NATIVE_PACKAGED_DATABASE_DIRECTORY}/${PACKAGED_METADATA_FILE_NAME}`;

let cachedSqlJsRuntimePromise: Promise<SqlJsStatic> | null = null;


export function isInstalledPackagedDatabaseCurrent(
  installedMetadata: PackagedDatabaseMetadata,
  bundledMetadata: PackagedDatabaseMetadata
): boolean {
  return installedMetadata.schemaVersion === bundledMetadata.schemaVersion
    && installedMetadata.builtAt === bundledMetadata.builtAt
    && installedMetadata.classCount === bundledMetadata.classCount;
}

export function resolvePackagedDatabaseAssetUrl(fileName = PACKAGED_DATABASE_FILE_NAME): string {
  return new URL(`assets/database/${fileName}`, window.location.origin).toString();
}

export function isNativePackagedRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

function encodeBytesToBase64(bytes: Uint8Array): string {
  let binaryString = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  return btoa(binaryString);
}

function decodeBase64ToBytes(base64Contents: string): Uint8Array {
  const binaryString = atob(base64Contents);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

/**
 * Ensures the native packaged database directory exists without failing when it is already present.
 *
 * @returns {Promise<void>}
 */
async function ensureNativePackagedDatabaseDirectory(): Promise<void> {
  try {
    await Filesystem.stat({
      directory: Directory.Data,
      path: NATIVE_PACKAGED_DATABASE_DIRECTORY
    });
  } catch {
    await Filesystem.mkdir({
      directory: Directory.Data,
      path: NATIVE_PACKAGED_DATABASE_DIRECTORY,
      recursive: true
    });
  }
}

/**
 * Ensures that the packaged database has been copied to native app storage.
 *
 * @returns Native path to the installed packaged database.
 */
export async function ensureInstalledPackagedDatabase(): Promise<string> {
  if (!isNativePackagedRuntime()) {
    return NATIVE_PACKAGED_DATABASE_PATH;
  }

  const bundledMetadata = await loadPackagedDatabaseMetadata();

  try {
    const [databaseStat, installedMetadataFile] = await Promise.all([
      Filesystem.stat({
        directory: Directory.Data,
        path: NATIVE_PACKAGED_DATABASE_PATH
      }),
      Filesystem.readFile({
        directory: Directory.Data,
        path: NATIVE_PACKAGED_METADATA_PATH,
        encoding: Encoding.UTF8
      })
    ]);

    if (!databaseStat || typeof installedMetadataFile.data !== "string") {
      throw new DatabaseError("The installed packaged database metadata could not be read.");
    }

    const installedMetadata = JSON.parse(installedMetadataFile.data) as PackagedDatabaseMetadata;

    if (isInstalledPackagedDatabaseCurrent(installedMetadata, bundledMetadata)) {
      return NATIVE_PACKAGED_DATABASE_PATH;
    }
  } catch {
    // Install or refresh the packaged database below.
  }

  await ensureNativePackagedDatabaseDirectory();

  const packagedDatabaseBytes = await loadPackagedDatabaseBinaryFromAsset();

  await Filesystem.writeFile({
    directory: Directory.Data,
    path: NATIVE_PACKAGED_DATABASE_PATH,
    data: encodeBytesToBase64(packagedDatabaseBytes),
    recursive: true
  });

  await Filesystem.writeFile({
    directory: Directory.Data,
    path: NATIVE_PACKAGED_METADATA_PATH,
    data: JSON.stringify(bundledMetadata),
    encoding: Encoding.UTF8,
    recursive: true
  });

  return NATIVE_PACKAGED_DATABASE_PATH;
}

/**
 * Reads the packaged database metadata emitted by the data pipeline.
 *
 * @returns Parsed database metadata.
 */
export async function loadPackagedDatabaseMetadata(): Promise<PackagedDatabaseMetadata> {
  const response = await fetch(resolvePackagedDatabaseAssetUrl(PACKAGED_METADATA_FILE_NAME));

  if (!response.ok) {
    throw new DatabaseError("The packaged database metadata could not be loaded.");
  }

  return (await response.json()) as PackagedDatabaseMetadata;
}

/**
 * Reads the packaged database asset as raw bytes.
 *
 * @returns Database bytes.
 */
export async function loadPackagedDatabaseBinaryFromAsset(): Promise<Uint8Array> {
  const response = await fetch(resolvePackagedDatabaseAssetUrl());

  if (!response.ok) {
    throw new DatabaseError("The packaged database asset could not be loaded.");
  }

  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Reads the packaged database bytes from the appropriate runtime location.
 *
 * @returns Database bytes.
 */
export async function loadPackagedDatabaseBinary(): Promise<Uint8Array> {
  if (!isNativePackagedRuntime()) {
    return loadPackagedDatabaseBinaryFromAsset();
  }

  const installedPath = await ensureInstalledPackagedDatabase();
  const file = await Filesystem.readFile({
    directory: Directory.Data,
    path: installedPath
  });

  if (typeof file.data === "string") {
    return decodeBase64ToBytes(file.data);
  }

  return new Uint8Array(await file.data.arrayBuffer());
}

/**
 * Returns a cached SQL.js runtime instance.
 *
 * @returns SQL.js runtime.
 */
export async function loadSqlJsRuntime(): Promise<SqlJsStatic> {
  if (!cachedSqlJsRuntimePromise) {
    cachedSqlJsRuntimePromise = initSqlJs({
      locateFile: () => sqlWasmUrl
    });
  }

  return cachedSqlJsRuntimePromise;
}

/**
 * Opens the packaged SQLite database from bundled assets.
 *
 * @returns Read-only SQL.js database instance backed by the packaged asset bytes.
 */
export async function openPackagedDatabase(): Promise<Database> {
  const [sqlJsRuntime, databaseBytes] = await Promise.all([loadSqlJsRuntime(), loadPackagedDatabaseBinary()]);

  return new sqlJsRuntime.Database(databaseBytes);
}
