import type { Database, SqlValue } from "sql.js";
import { toHiragana, toKatakana } from "wanakana";

import { loadPackagedDatabaseMetadata, openPackagedDatabase } from "./Database/PackagedDatabase";
import type { PackagedDatabaseMetadata } from "./Database/Contracts/PackagedDatabaseMetadata";
import type { CharacterSummary, DetailedKanjiEntry, MeaningEntry } from "./DomainTypes";
import { DatabaseError } from "./AppErrors";

export interface KanjiSummary extends CharacterSummary {
  readonly strokeCount: number;
}

export interface SourceAttribution {
  readonly id: string;
  readonly attribution: string;
  readonly homepage: string;
  readonly license: string;
  readonly downloadUrl: string;
  readonly downloadedAt: string;
  readonly upstreamVersion: string | null;
}

interface KanjiEntryRow {
  readonly character: string;
  readonly radical: string;
  readonly componentsJson: string;
  readonly strokeCount: number;
  readonly strokeOrderSvg: string;
  readonly jlptLevel: string | null;
  readonly joyoLevel: string | null;
}

const MAX_SEARCH_RESULTS = 60;

/**
 * Provides read-only access to the packaged kanji dictionary.
 */
export class KanjiRepository {
  private database: Database | null = null;

  private metadata: PackagedDatabaseMetadata | null = null;

  private readonly summaryCache = new Map<string, KanjiSummary>();

  async initialize(): Promise<void> {
    if (this.database !== null) {
      return;
    }

    const [database, metadata] = await Promise.all([
      openPackagedDatabase(),
      loadPackagedDatabaseMetadata()
    ]);

    this.database = database;
    this.metadata = metadata;
    await this.preloadSummaries();
  }

  getMetadata(): PackagedDatabaseMetadata | null {
    return this.metadata;
  }

  async search(term: string): Promise<ReadonlyArray<KanjiSummary>> {
    await this.initialize();
    const trimmedTerm = term.trim();

    if (trimmedTerm.length === 0) {
      return [];
    }

    if (isKanji(trimmedTerm)) {
      return this.searchByKanji(trimmedTerm);
    }

    return this.searchByReading(trimmedTerm);
  }

  private async searchByKanji(term: string): Promise<ReadonlyArray<KanjiSummary>> {
    const database = this.requireDatabase();
    const characters: string[] = [];
    const seen = new Set<string>();

    const exactMatch = readRows(
      database,
      `SELECT character, stroke_count FROM kanji_entries WHERE character = ? ORDER BY stroke_count LIMIT 1`,
      [term]
    );
    for (const row of exactMatch) {
      const char = readRequiredString(row, "character");
      if (!seen.has(char)) {
        seen.add(char);
        characters.push(char);
      }
    }

    const likeTerm = `%${term}%`;
    const componentMatches = readRows(
      database,
      `SELECT character, stroke_count FROM kanji_entries WHERE components_json LIKE ? ORDER BY stroke_count LIMIT ${MAX_SEARCH_RESULTS}`,
      [likeTerm]
    );
    for (const row of componentMatches) {
      const char = readRequiredString(row, "character");
      if (!seen.has(char)) {
        seen.add(char);
        characters.push(char);
      }
    }

    return characters
      .slice(0, MAX_SEARCH_RESULTS)
      .map(character => this.getCachedSummary(character))
      .filter((summary): summary is KanjiSummary => summary !== null);
  }

  private async searchByReading(term: string): Promise<ReadonlyArray<KanjiSummary>> {
    const database = this.requireDatabase();
    const normalizedTerms = this.createSearchTerms(term);
    if (normalizedTerms.length === 0) {
      return [];
    }

    const allResults: Array<{ character: string; strokeCount: number }> = [];

    for (const searchTerm of normalizedTerms) {
      const rows = readRows(
        database,
        `
          SELECT DISTINCT e.character, e.stroke_count
          FROM kanji_entries e
          LEFT JOIN kanji_readings r ON r.character = e.character
          WHERE r.value = ?
          ORDER BY e.stroke_count
          LIMIT ${MAX_SEARCH_RESULTS}
        `,
        [searchTerm]
      );

      for (const row of rows) {
        const character = readRequiredString(row, "character");
        const strokeCount = readRequiredNumber(row, "stroke_count");
        if (!allResults.some(r => r.character === character)) {
          allResults.push({ character, strokeCount });
        }
      }
    }

    const sorted = allResults
      .sort((a, b) => a.strokeCount - b.strokeCount)
      .slice(0, MAX_SEARCH_RESULTS);

    return sorted
      .map(({ character }) => this.getCachedSummary(character))
      .filter((summary): summary is KanjiSummary => summary !== null);
  }

  async getSummary(character: string): Promise<KanjiSummary | null> {
    await this.initialize();
    return this.getCachedSummary(character);
  }

  getCachedSummarySnapshot(character: string): KanjiSummary | null {
    return this.getCachedSummary(character);
  }

  async getSummaries(characters: ReadonlyArray<string>): Promise<ReadonlyArray<KanjiSummary>> {
    await this.initialize();
    return characters
      .map(character => this.getCachedSummary(character))
      .filter((summary): summary is KanjiSummary => summary !== null);
  }

  async getDetails(character: string): Promise<DetailedKanjiEntry> {
    await this.initialize();
    const database = this.requireDatabase();
    const rows = readRows(
      database,
      `
        SELECT character,
               radical,
               components_json AS componentsJson,
               stroke_count AS strokeCount,
               stroke_order_svg AS strokeOrderSvg,
               jlpt_level AS jlptLevel,
               joyo_level AS joyoLevel
        FROM kanji_entries
        WHERE character = ?
        LIMIT 1
      `,
      [character]
    );

    if (rows.length === 0) {
      throw new DatabaseError("The character details could not be loaded.");
    }

    const entryRow = toKanjiEntryRow(rows[0]);
    const meanings = this.loadMeanings(character);
    const kunyomi = this.loadReadings(character, "kunyomi");
    const onyomi = this.loadReadings(character, "onyomi");
    const kunyomiExamples = this.loadExamples(character, "kunyomi");
    const onyomiExamples = this.loadExamples(character, "onyomi");
    const components = parseStringArray(entryRow.componentsJson);

    return {
      character: entryRow.character,
      radical: entryRow.radical,
      ...(components.length > 0 ? { components } : {}),
      ...(meanings.length > 0 ? { meanings } : {}),
      ...(kunyomi.length > 0 ? { kunyomi } : {}),
      ...(kunyomiExamples.length > 0 ? { kunyomiExamples } : {}),
      ...(onyomi.length > 0 ? { onyomi } : {}),
      ...(onyomiExamples.length > 0 ? { onyomiExamples } : {}),
      strokeCount: entryRow.strokeCount,
      strokeOrder: entryRow.strokeOrderSvg,
      ...(entryRow.jlptLevel ? { jlptLevel: formatJlptLevel(entryRow.jlptLevel) } : {}),
      ...(entryRow.joyoLevel ? { joyoLevel: formatJoyoLevel(entryRow.joyoLevel) } : {})
    };
  }

  async loadSourceAttributions(): Promise<ReadonlyArray<SourceAttribution>> {
    const response = await fetch(new URL("assets/attributions/data-sources.json", window.location.origin));

    if (!response.ok) {
      throw new DatabaseError("The source acknowledgments could not be loaded.");
    }

    const parsed = (await response.json()) as { readonly sources?: unknown };

    if (!Array.isArray(parsed.sources)) {
      return [];
    }

    return parsed.sources.map(source => toAttribution(source)).filter((source): source is SourceAttribution => source !== null);
  }

  getAllCachedSummaries(): ReadonlyArray<KanjiSummary> {
    return [...this.summaryCache.values()];
  }

  private async preloadSummaries(): Promise<void> {
    const database = this.requireDatabase();
    const rows = readRows(
      database,
      `
        SELECT character,
               stroke_count AS strokeCount,
               jlpt_level AS jlptLevel,
               joyo_level AS joyoLevel
        FROM kanji_entries
      `,
      []
    );

    for (const row of rows) {
      const character = readRequiredString(row, "character");
      this.summaryCache.set(character, {
        character,
        primaryReadings: this.loadPrimaryReadings(character),
        levels: buildLevels(readOptionalString(row, "jlptLevel"), readOptionalString(row, "joyoLevel")),
        strokeCount: readRequiredNumber(row, "strokeCount")
      });
    }
  }

  private loadPrimaryReadings(character: string): ReadonlyArray<string> {
    const database = this.requireDatabase();
    const rows = readRows(
      database,
      `
        SELECT value
        FROM kanji_readings
        WHERE character = ?
        ORDER BY CASE reading_type WHEN 'onyomi' THEN 0 ELSE 1 END, value
        LIMIT 4
      `,
      [character]
    );

    return rows.map(row => readRequiredString(row, "value"));
  }

  private loadReadings(character: string, readingType: "kunyomi" | "onyomi"): ReadonlyArray<string> {
    const database = this.requireDatabase();
    return readRows(
      database,
      "SELECT value FROM kanji_readings WHERE character = ? AND reading_type = ? ORDER BY value",
      [character, readingType]
    ).map(row => readRequiredString(row, "value"));
  }

  private loadExamples(character: string, readingType: "kunyomi" | "onyomi"): ReadonlyArray<string> {
    const database = this.requireDatabase();
    return readRows(
      database,
      "SELECT value FROM kanji_examples WHERE character = ? AND reading_type = ? ORDER BY value",
      [character, readingType]
    ).map(row => readRequiredString(row, "value"));
  }

  private loadMeanings(character: string): ReadonlyArray<MeaningEntry> {
    const database = this.requireDatabase();
    return readRows(
      database,
      "SELECT language, value FROM kanji_meanings WHERE character = ? ORDER BY language, value",
      [character]
    ).map(row => ({
      language: readRequiredString(row, "language"),
      value: readRequiredString(row, "value")
    }));
  }

  private getCachedSummary(character: string): KanjiSummary | null {
    const summary = this.summaryCache.get(character);

    if (!summary) {
      return null;
    }

    return {
      character: summary.character,
      primaryReadings: [...summary.primaryReadings],
      levels: [...summary.levels],
      strokeCount: summary.strokeCount
    };
  }

  private createSearchTerms(term: string): ReadonlyArray<string> {
    const trimmedTerm = term.trim();

    if (trimmedTerm.length === 0) {
      return [];
    }

    return [...new Set([
      trimmedTerm,
      toHiragana(trimmedTerm),
      toKatakana(trimmedTerm)
    ].filter(value => value.trim().length > 0))];
  }

  private requireDatabase(): Database {
    if (this.database === null) {
      throw new DatabaseError("The offline dictionary is not ready.");
    }

    return this.database;
  }
}

function readRows(database: Database, sql: string, values: ReadonlyArray<SqlValue>): ReadonlyArray<Record<string, SqlValue>> {
  const statement = database.prepare(sql);

  try {
    if (values.length > 0) {
      statement.bind(values);
    }

    const rows: Record<string, SqlValue>[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    return rows;
  } finally {
    statement.free();
  }
}

function readRequiredString(row: Record<string, SqlValue>, key: string): string {
  const value = row[key];

  if (typeof value !== "string") {
    throw new DatabaseError("The dictionary data could not be read.");
  }

  return value;
}

function readOptionalString(row: Record<string, SqlValue>, key: string): string | null {
  const value = row[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function readRequiredNumber(row: Record<string, SqlValue>, key: string): number {
  const value = row[key];

  if (typeof value !== "number") {
    throw new DatabaseError("The dictionary data could not be read.");
  }

  return value;
}


function isKanji(term: string): boolean {
  const KANJI_RANGE = /[\u4e00-\u9fff]/;
  return KANJI_RANGE.test(term);
}

function toKanjiEntryRow(row: Record<string, SqlValue>): KanjiEntryRow {
  return {
    character: readRequiredString(row, "character"),
    radical: readRequiredString(row, "radical"),
    componentsJson: readRequiredString(row, "componentsJson"),
    strokeCount: readRequiredNumber(row, "strokeCount"),
    strokeOrderSvg: readRequiredString(row, "strokeOrderSvg"),
    jlptLevel: readOptionalString(row, "jlptLevel"),
    joyoLevel: readOptionalString(row, "joyoLevel")
  };
}

function parseStringArray(value: string): ReadonlyArray<string> {
  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function buildLevels(jlptLevel: string | null, joyoLevel: string | null): ReadonlyArray<string> {
  return [
    jlptLevel ? formatJlptLevel(jlptLevel) : null,
    joyoLevel ? formatJoyoLevel(joyoLevel) : null
  ].filter((level): level is string => level !== null);
}

function formatJlptLevel(level: string): string {
  return level.startsWith("N") ? `JLPT ${level}` : `JLPT N${level}`;
}

function formatJoyoLevel(level: string): string {
  return `Joyo ${level}`;
}

function toAttribution(value: unknown): SourceAttribution | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const id = candidate.id;
  const attribution = candidate.attribution;
  const homepage = candidate.homepage;
  const license = candidate.license;
  const downloadUrl = candidate.downloadUrl;
  const downloadedAt = candidate.downloadedAt;
  const upstreamVersion = candidate.upstreamVersion;

  if (
    typeof id !== "string" ||
    typeof attribution !== "string" ||
    typeof homepage !== "string" ||
    typeof license !== "string" ||
    typeof downloadUrl !== "string" ||
    typeof downloadedAt !== "string"
  ) {
    return null;
  }

  return {
    id,
    attribution,
    homepage,
    license,
    downloadUrl,
    downloadedAt,
    upstreamVersion: typeof upstreamVersion === "string" ? upstreamVersion : null
  };
}
