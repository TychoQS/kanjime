import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

import type { PackagedDatabaseMetadata } from "./Contracts/PackagedDatabaseMetadata";

const PACKAGED_DATABASE_FILE_NAME = "kanji.sqlite";
const PACKAGED_METADATA_FILE_NAME = "kanji.metadata.json";
const NATIVE_PACKAGED_DATABASE_DIRECTORY = "databases";
const NATIVE_PACKAGED_DATABASE_PATH = `${NATIVE_PACKAGED_DATABASE_DIRECTORY}/${PACKAGED_DATABASE_FILE_NAME}`;

let cachedSqlJsRuntimePromise: Promise<SqlJsStatic> | null = null;

/**
 * Resolves the asset URL used to serve the packaged database.
 *
 * @param fileName Packaged file name.
 * @returns Asset URL suitable for `fetch`.
 *
 * @pre fileName is the name of a file emitted under `public/assets/database`.
 * @post The returned URL is valid both for the Vite dev server and for the packaged web bundle.
 */
export function resolvePackagedDatabaseAssetUrl(fileName = PACKAGED_DATABASE_FILE_NAME): string {
  return new URL(`assets/database/${fileName}`, window.location.origin).toString();
}

/**
 * Resolves whether the current runtime is the native packaged Capacitor shell.
 *
 * @returns `true` when the application runs inside a native Capacitor container.
 *
 * @post The return value reflects the current execution environment.
 */
export function isNativePackagedRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Encodes binary contents as base64.
 *
 * @param bytes Binary payload.
 * @returns Base64-encoded contents.
 *
 * @post The returned string can be written with Capacitor Filesystem using `Encoding.BASE64`.
 */
function encodeBytesToBase64(bytes: Uint8Array): string {
  let binaryString = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  return btoa(binaryString);
}

/**
 * Decodes a base64-encoded payload into bytes.
 *
 * @param base64Contents Base64 payload returned by Capacitor Filesystem.
 * @returns Decoded bytes.
 *
 * @post The returned bytes represent the original binary payload.
 */
function decodeBase64ToBytes(base64Contents: string): Uint8Array {
  const binaryString = atob(base64Contents);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes;
}

/**
 * Ensures that the packaged database has been copied to native app storage.
 *
 * @returns Native path to the installed packaged database.
 *
 * @pre The application is running inside a native Capacitor container.
 * @post The packaged database exists in `Directory.Data` after the promise resolves.
 */
export async function ensureInstalledPackagedDatabase(): Promise<string> {
  if (!isNativePackagedRuntime()) {
    return NATIVE_PACKAGED_DATABASE_PATH;
  }

  try {
    await Filesystem.stat({
      directory: Directory.Data,
      path: NATIVE_PACKAGED_DATABASE_PATH
    });

    return NATIVE_PACKAGED_DATABASE_PATH;
  } catch {
    await Filesystem.mkdir({
      directory: Directory.Data,
      path: NATIVE_PACKAGED_DATABASE_DIRECTORY,
      recursive: true
    });

    const packagedDatabaseBytes = await loadPackagedDatabaseBinaryFromAsset();

    await Filesystem.writeFile({
      directory: Directory.Data,
      path: NATIVE_PACKAGED_DATABASE_PATH,
      data: encodeBytesToBase64(packagedDatabaseBytes),
      recursive: true
    });

    return NATIVE_PACKAGED_DATABASE_PATH;
  }
}

/**
 * Reads the packaged database metadata emitted by the data pipeline.
 *
 * @returns Parsed database metadata.
 *
 * @pre The packaged metadata artifact exists under `public/assets/database`.
 * @post The returned metadata describes the same database asset served to the application.
 */
export async function loadPackagedDatabaseMetadata(): Promise<PackagedDatabaseMetadata> {
  const response = await fetch(resolvePackagedDatabaseAssetUrl(PACKAGED_METADATA_FILE_NAME));

  if (!response.ok) {
    throw new Error("The packaged database metadata could not be loaded.");
  }

  return (await response.json()) as PackagedDatabaseMetadata;
}

/**
 * Reads the packaged database asset as raw bytes.
 *
 * @returns Database bytes.
 *
 * @pre The packaged database artifact exists under `public/assets/database`.
 * @post The returned bytes can be opened directly by SQL.js.
 */
export async function loadPackagedDatabaseBinaryFromAsset(): Promise<Uint8Array> {
  const response = await fetch(resolvePackagedDatabaseAssetUrl());

  if (!response.ok) {
    throw new Error("The packaged database asset could not be loaded.");
  }

  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Reads the packaged database bytes from the appropriate runtime location.
 *
 * @returns Database bytes.
 *
 * @post In web it reads the bundled asset directly; in native it reads the installed local copy.
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
 *
 * @post The same runtime promise is reused across calls during the same application session.
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
 *
 * @pre The packaged database has been generated and bundled with the current application build.
 * @post The returned database can be queried in both development and packaged runtimes.
 */
export async function openPackagedDatabase(): Promise<Database> {
  const [sqlJsRuntime, databaseBytes] = await Promise.all([loadSqlJsRuntime(), loadPackagedDatabaseBinary()]);

  return new sqlJsRuntime.Database(databaseBytes);
}
