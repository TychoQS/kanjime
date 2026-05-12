declare module "sql.js" {
  export type SqlValue = string | number | Uint8Array | null;

  export interface QueryExecResult {
    readonly columns: string[];
    readonly values: SqlValue[][];
  }

  export interface Statement {
    bind(values?: ReadonlyArray<SqlValue>): boolean;
    step(): boolean;
    get(): SqlValue[];
    getAsObject(): Record<string, SqlValue>;
    run(values?: ReadonlyArray<string | number | null>): void;
    reset(): void;
    free(): void;
  }

  export interface Database {
    exec(sql: string): QueryExecResult[];
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
