import type { Database, Statement } from "sql.js";

import { openPackagedDatabase } from "../Database/PackagedDatabase";
import type { CharacterSummary, DetailedKanjiEntry, HistoryEntry, MeaningEntry } from "../DomainTypes";
import { createSearchTermVariants } from "./Romaji";

type SqlParameter = string | number | null;
type SqlRow = Readonly<Record<string, unknown>>;
type QueryStatement = Statement & {
  bind(values: ReadonlyArray<SqlParameter>): boolean;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
};

let packagedDatabasePromise: Promise<Database> | null = null;

/**
 * Read-only repository for packaged kanji data.
 *
 * @inv All data comes from the bundled SQLite database.
 */
export interface KanjiRepository {
  /**
   * Searches kanji by character, reading, or meaning.
   *
   * @pre term is non-empty after trimming.
   * @post Results contain character summaries loaded from the packaged database.
   */
  search(term: string): Promise<ReadonlyArray<CharacterSummary>>;

  /**
   * Loads summary rows for known characters.
   *
   * @pre characters contain valid kanji identifiers.
   * @post Returned summaries preserve the order of the supplied characters.
   */
  getSummariesForCharacters(characters: ReadonlyArray<string>): Promise<ReadonlyArray<CharacterSummary>>;

  /**
   * Loads full kanji details.
   *
   * @pre character is a valid packaged kanji.
   * @post Returned details omit unavailable optional fields.
   */
  getDetails(character: string): Promise<DetailedKanjiEntry>;

  /**
   * Loads the stroke count for a kanji.
   *
   * @pre character is a valid packaged kanji.
   * @post Returns null when the character is unknown.
   */
  getStrokeCount(character: string): Promise<number | null>;

  /**
   * Creates a natural-language summary for history rows.
   *
   * @pre entry belongs to persisted history.
   * @post The returned entry includes a display summary.
   */
  hydrateHistoryEntry(entry: { character: string; createdAt: string }): Promise<HistoryEntry>;

  /**
   * Loads application attribution information.
   *
   * @post Returned items are suitable for the About screen.
   */
  getAttributionItems(): Promise<ReadonlyArray<{ label: string; value: string }>>;
}

/**
 * Creates the packaged kanji repository.
 *
 * @returns Repository backed by the generated SQLite database.
 *
 * @post Database access is cached for the application session.
 */
export function createKanjiRepository(): KanjiRepository {
  async function getDatabase(): Promise<Database> {
    if (packagedDatabasePromise === null) {
      packagedDatabasePromise = openPackagedDatabase();
    }

    return packagedDatabasePromise;
  }

  async function loadSummary(database: Database, character: string): Promise<CharacterSummary | null> {
    const entryRows = queryRows(
      database,
      `SELECT character, jlpt_level, joyo_level
       FROM kanji_entries
       WHERE character = ?`,
      [character]
    );

    if (entryRows.length === 0) {
      return null;
    }

    const readingRows = queryRows(
      database,
      `SELECT value
       FROM kanji_readings
       WHERE character = ?
       ORDER BY reading_type DESC, value
       LIMIT 4`,
      [character]
    );
    const entry = entryRows[0];

    return {
      character,
      primaryReadings: readingRows.map(row => getRequiredString(row, "value")),
      levels: createLevels(getOptionalString(entry, "jlpt_level"), getOptionalString(entry, "joyo_level"))
    };
  }

  return {
    async search(term: string): Promise<ReadonlyArray<CharacterSummary>> {
      const variants = createSearchTermVariants(term);

      if (variants.length === 0) {
        return [];
      }

      const database = await getDatabase();
      const parameters = variants.flatMap(variant => [variant, `%${variant}%`, `%${variant}%`]);
      const conditions = variants.map(() => (
        "(e.character = ? OR r.value LIKE ? COLLATE NOCASE OR m.value LIKE ? COLLATE NOCASE)"
      )).join(" OR ");
      const rows = queryRows(
        database,
        `SELECT DISTINCT e.character
         FROM kanji_entries e
         LEFT JOIN kanji_readings r ON r.character = e.character
         LEFT JOIN kanji_meanings m ON m.character = e.character
         WHERE ${conditions}
         ORDER BY e.stroke_count ASC, e.character ASC
         LIMIT 50`,
        parameters
      );
      const summaries = await Promise.all(rows.map(row => loadSummary(database, getRequiredString(row, "character"))));

      return summaries.filter(isCharacterSummary);
    },
    async getSummariesForCharacters(characters): Promise<ReadonlyArray<CharacterSummary>> {
      const database = await getDatabase();
      const summaries = await Promise.all(characters.map(character => loadSummary(database, character)));

      return summaries.map((summary, index) => summary ?? {
        character: characters[index],
        primaryReadings: [],
        levels: []
      });
    },
    async getDetails(character: string): Promise<DetailedKanjiEntry> {
      const database = await getDatabase();
      const entryRows = queryRows(
        database,
        `SELECT character, radical, components_json, stroke_count, stroke_order_svg, jlpt_level, joyo_level
         FROM kanji_entries
         WHERE character = ?`,
        [character]
      );

      if (entryRows.length === 0) {
        throw new Error("The character details could not be loaded.");
      }

      const entry = entryRows[0];
      const meanings = queryRows(
        database,
        `SELECT language, value
         FROM kanji_meanings
         WHERE character = ?
         ORDER BY language, value`,
        [character]
      ).map(row => ({
        language: getRequiredString(row, "language"),
        value: getRequiredString(row, "value")
      }));
      const kunyomi = loadValues(database, character, "kunyomi", "kanji_readings");
      const onyomi = loadValues(database, character, "onyomi", "kanji_readings");
      const kunyomiExamples = loadValues(database, character, "kunyomi", "kanji_examples");
      const onyomiExamples = loadValues(database, character, "onyomi", "kanji_examples");

      return {
        character: getRequiredString(entry, "character"),
        radical: getRequiredString(entry, "radical"),
        components: parseComponents(getRequiredString(entry, "components_json")),
        meanings,
        kunyomi,
        kunyomiExamples,
        onyomi,
        onyomiExamples,
        strokeCount: getRequiredNumber(entry, "stroke_count"),
        strokeOrder: getRequiredString(entry, "stroke_order_svg"),
        jlptLevel: formatJlptLevel(getOptionalString(entry, "jlpt_level")),
        joyoLevel: formatJoyoLevel(getOptionalString(entry, "joyo_level"))
      };
    },
    async getStrokeCount(character: string): Promise<number | null> {
      const database = await getDatabase();
      const rows = queryRows(
        database,
        "SELECT stroke_count FROM kanji_entries WHERE character = ?",
        [character]
      );

      return rows.length > 0 ? getRequiredNumber(rows[0], "stroke_count") : null;
    },
    async hydrateHistoryEntry(entry): Promise<HistoryEntry> {
      const summaries = await this.getSummariesForCharacters([entry.character]);
      const summary = summaries[0];
      const readingText = summary.primaryReadings.slice(0, 2).join(" ");
      const levelText = summary.levels.join(" ");

      return {
        character: entry.character,
        createdAt: entry.createdAt,
        summary: [readingText, levelText].filter(value => value.length > 0).join(" · ") || entry.character
      };
    },
    async getAttributionItems(): Promise<ReadonlyArray<{ label: string; value: string }>> {
      const database = await getDatabase();
      const rows = queryRows(
        database,
        `SELECT display_name, attribution, license, homepage
         FROM source_attributions
         ORDER BY display_name`,
        []
      );

      return rows.flatMap(row => ([
        {
          label: `${getRequiredString(row, "display_name")} attribution`,
          value: getRequiredString(row, "attribution")
        },
        {
          label: `${getRequiredString(row, "display_name")} license`,
          value: getRequiredString(row, "license")
        },
        {
          label: `${getRequiredString(row, "display_name")} homepage`,
          value: getRequiredString(row, "homepage")
        }
      ]));
    }
  };
}

/**
 * Executes a typed query against SQL.js.
 *
 * @param database Open SQL.js database.
 * @param sql SQL statement.
 * @param parameters Bound SQL parameters.
 * @returns Query rows as records.
 *
 * @post The statement is always freed.
 */
function queryRows(database: Database, sql: string, parameters: ReadonlyArray<SqlParameter>): ReadonlyArray<SqlRow> {
  const statement = database.prepare(sql) as QueryStatement;

  try {
    statement.bind(parameters);
    const rows: SqlRow[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    return rows;
  } finally {
    statement.free();
  }
}

/**
 * Loads reading or example values.
 *
 * @post Returned values are ordered for deterministic display.
 */
function loadValues(
  database: Database,
  character: string,
  readingType: "kunyomi" | "onyomi",
  tableName: "kanji_readings" | "kanji_examples"
): ReadonlyArray<string> {
  return queryRows(
    database,
    `SELECT value FROM ${tableName} WHERE character = ? AND reading_type = ? ORDER BY value`,
    [character, readingType]
  ).map(row => getRequiredString(row, "value"));
}

function getRequiredString(row: SqlRow, key: string): string {
  const value = row[key];

  if (typeof value !== "string") {
    throw new Error("The character data could not be read.");
  }

  return value;
}

function getOptionalString(row: SqlRow, key: string): string | null {
  const value = row[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function getRequiredNumber(row: SqlRow, key: string): number {
  const value = row[key];

  if (typeof value !== "number") {
    throw new Error("The character data could not be read.");
  }

  return value;
}

function parseComponents(value: string): ReadonlyArray<string> {
  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((item): item is string => typeof item === "string");
}

function createLevels(jlptLevel: string | null, joyoLevel: string | null): ReadonlyArray<string> {
  return [
    formatJlptLevel(jlptLevel),
    formatJoyoLevel(joyoLevel)
  ].filter((value): value is string => value !== undefined);
}

function formatJlptLevel(level: string | null): string | undefined {
  return level ? `JLPT N${level}` : undefined;
}

function formatJoyoLevel(level: string | null): string | undefined {
  return level ? `Joyo ${level}` : undefined;
}

function isCharacterSummary(value: CharacterSummary | null): value is CharacterSummary {
  return value !== null;
}
