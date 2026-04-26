/**
 * Type declarations for the sql.js library.
 *
 * @pre The sql-wasm.wasm binary is available at runtime.
 * @post The database API can be used to run prepared SQL statements.
 */
declare module "sql.js" {
  export type SqlValue = string | number | Uint8Array | null;

  export interface Statement {
    run(values?: ReadonlyArray<SqlValue>): void;
    bind(values?: ReadonlyArray<SqlValue>): boolean;
    step(): boolean;
    getAsObject(): Record<string, SqlValue>;
    reset(): void;
    free(): void;
  }

  export interface Database {
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: {
      new (data?: Uint8Array): Database;
    };
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}
