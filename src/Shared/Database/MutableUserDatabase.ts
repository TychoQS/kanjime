import { Capacitor } from "@capacitor/core";
import { CapgoCapacitorFastSql } from "@capgo/capacitor-fast-sql";
import type { SQLRow, SQLValue } from "@capgo/capacitor-fast-sql";
import type { Database, SqlJsStatic, Statement } from "sql.js";

import { loadSqlJsRuntime } from "./PackagedDatabase";

type MutableRow = Readonly<Record<string, SQLValue>>;
type MutableStatement = Statement & {
  bind(values: ReadonlyArray<SQLValue>): boolean;
  step(): boolean;
  getAsObject(): Record<string, SQLValue>;
};
type MutableDatabase = Database & {
  getRowsModified(): number;
};

const USER_DATABASE_NAME = "user.sqlite";
const INDEXED_DB_NAME = "TfgAppUserDatabase";
const INDEXED_DB_STORE = "databases";

/**
 * Minimal mutable SQLite connection used by user-owned data.
 *
 * @inv Web uses local SQL.js and IndexedDB, while native uses Fast SQL.
 */
export interface MutableUserDatabase {
  /**
   * Executes a SELECT statement.
   *
   * @pre statement is a read query.
   * @post Returned rows are SQLite records.
   */
  query(statement: string, params?: ReadonlyArray<SQLValue>): Promise<ReadonlyArray<MutableRow>>;

  /**
   * Executes a mutating statement.
   *
   * @pre statement changes local user data or schema.
   * @post Changes are persisted before the promise resolves.
   */
  run(statement: string, params?: ReadonlyArray<SQLValue>): Promise<void>;
}

/**
 * Opens the mutable user database.
 *
 * @returns Mutable SQLite adapter for the current platform.
 *
 * @post The schema can be initialized by callers without knowing the platform.
 */
export async function openMutableUserDatabase(): Promise<MutableUserDatabase> {
  if (Capacitor.isNativePlatform()) {
    await CapgoCapacitorFastSql.connect({
      database: USER_DATABASE_NAME,
      readOnly: false
    });

    return createNativeMutableUserDatabase();
  }

  return createWebMutableUserDatabase();
}

function createNativeMutableUserDatabase(): MutableUserDatabase {
  return {
    async query(statement, params = []): Promise<ReadonlyArray<MutableRow>> {
      const result = await CapgoCapacitorFastSql.execute({
        database: USER_DATABASE_NAME,
        statement,
        params: [...params]
      });

      return result.rows.map(row => normalizeNativeRow(row));
    },
    async run(statement, params = []): Promise<void> {
      await CapgoCapacitorFastSql.execute({
        database: USER_DATABASE_NAME,
        statement,
        params: [...params]
      });
    }
  };
}

async function createWebMutableUserDatabase(): Promise<MutableUserDatabase> {
  const sqlRuntime = await loadSqlJsRuntime();
  const storedBytes = await loadStoredDatabaseBytes();
  const database = new sqlRuntime.Database(storedBytes) as MutableDatabase;

  return {
    async query(statement, params = []): Promise<ReadonlyArray<MutableRow>> {
      return executeWebQuery(database, statement, params);
    },
    async run(statement, params = []): Promise<void> {
      executeWebQuery(database, statement, params);
      await saveStoredDatabaseBytes(database.export());
    }
  };
}

function executeWebQuery(
  database: MutableDatabase,
  statementText: string,
  params: ReadonlyArray<SQLValue>
): ReadonlyArray<MutableRow> {
  const statement = database.prepare(statementText) as MutableStatement;

  try {
    statement.bind(params);
    const rows: MutableRow[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    return rows;
  } finally {
    statement.free();
  }
}

function normalizeNativeRow(row: SQLRow): MutableRow {
  return Object.fromEntries(Object.entries(row)) as MutableRow;
}

async function loadStoredDatabaseBytes(): Promise<Uint8Array | undefined> {
  const database = await openIndexedDatabase();
  const transaction = database.transaction(INDEXED_DB_STORE, "readonly");
  const store = transaction.objectStore(INDEXED_DB_STORE);
  const result = await requestToPromise<Uint8Array | undefined>(store.get(USER_DATABASE_NAME));
  database.close();

  return result;
}

async function saveStoredDatabaseBytes(bytes: Uint8Array): Promise<void> {
  const database = await openIndexedDatabase();
  const transaction = database.transaction(INDEXED_DB_STORE, "readwrite");
  const store = transaction.objectStore(INDEXED_DB_STORE);
  await requestToPromise<IDBValidKey>(store.put(bytes, USER_DATABASE_NAME));
  database.close();
}

function openIndexedDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, 1);

    request.onerror = () => reject(request.error ?? new Error("Local data could not be opened."));
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(INDEXED_DB_STORE)) {
        database.createObjectStore(INDEXED_DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("Local data could not be saved."));
    request.onsuccess = () => resolve(request.result);
  });
}
