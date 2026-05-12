import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from "@capacitor-community/sqlite";

import type { ApplicationTheme, HistoryCategory, HistoryGroup } from "./DomainTypes";
import { normalizeLocale, type SupportedLocale } from "./I18n";

interface PersistedPreferences {
  readonly language: SupportedLocale;
  readonly theme: ApplicationTheme;
}

interface PersistedHistoryEntry {
  readonly character: string;
  readonly category: HistoryCategory;
  readonly createdAt: string;
  readonly summary: string;
}

const DATABASE_NAME = "kanji_app_state";
const PREFERENCES_STORAGE_KEY = "tfg-app.preferences";
const HISTORY_STORAGE_KEY = "tfg-app.history";
const DEFAULT_PREFERENCES: PersistedPreferences = {
  language: "en-US",
  theme: "system"
};
const HISTORY_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];

/**
 * Persists user preferences and history in native SQLite with a web fallback.
 */
export class AppPersistence {
  private connection: SQLiteDBConnection | null = null;

  private usesNativeSQLite = false;

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.usesNativeSQLite = false;
      return;
    }

    try {
      const sqliteConnection = new SQLiteConnection(CapacitorSQLite);
      const connection = await sqliteConnection.createConnection(DATABASE_NAME, false, "no-encryption", 1, false);
      await connection.open();
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS preferences (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS history_entries (
          character TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TEXT NOT NULL,
          summary TEXT NOT NULL,
          PRIMARY KEY (character, category)
        );
      `);
      this.connection = connection;
      this.usesNativeSQLite = true;
    } catch {
      this.connection = null;
      this.usesNativeSQLite = false;
    }
  }

  async getPreferences(): Promise<PersistedPreferences> {
    if (this.usesNativeSQLite && this.connection) {
      const result = await this.connection.query("SELECT key, value FROM preferences");
      const rows = readNativeRows(result.values);
      const language = rows.find(row => row.key === "language")?.value;
      const theme = rows.find(row => row.key === "theme")?.value;

      return {
        language: typeof language === "string" ? normalizeLocale(language) : DEFAULT_PREFERENCES.language,
        theme: isApplicationTheme(theme) ? theme : DEFAULT_PREFERENCES.theme
      };
    }

    return readLocalPreferences();
  }

  async savePreferences(preferences: PersistedPreferences): Promise<void> {
    if (this.usesNativeSQLite && this.connection) {
      await this.connection.run(
        "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)",
        ["language", preferences.language]
      );
      await this.connection.run(
        "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)",
        ["theme", preferences.theme]
      );
      return;
    }

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }

  async loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
    const entries = this.usesNativeSQLite && this.connection
      ? await this.loadNativeHistoryEntries()
      : readLocalHistoryEntries();

    return HISTORY_CATEGORIES.map(category => ({
      category,
      entries: entries
        .filter(entry => entry.category === category)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .map(entry => ({
          character: entry.character,
          createdAt: entry.createdAt,
          summary: entry.summary
        }))
    }));
  }

  async saveHistoryEntry(entry: PersistedHistoryEntry): Promise<void> {
    if (!isHistoryCategory(entry.category) || entry.character.trim().length === 0) {
      return;
    }

    if (this.usesNativeSQLite && this.connection) {
      await this.connection.run(
        `
          INSERT OR REPLACE INTO history_entries (character, category, created_at, summary)
          VALUES (?, ?, ?, ?)
        `,
        [entry.character, entry.category, entry.createdAt, entry.summary]
      );
      return;
    }

    const nextEntries = [
      ...readLocalHistoryEntries().filter(candidate => (
        candidate.character !== entry.character ||
        candidate.category !== entry.category
      )),
      entry
    ];
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextEntries));
  }

  private async loadNativeHistoryEntries(): Promise<ReadonlyArray<PersistedHistoryEntry>> {
    if (!this.connection) {
      return [];
    }

    const result = await this.connection.query(
      `
        SELECT character,
               category,
               created_at AS createdAt,
               summary
        FROM history_entries
      `
    );

    return readNativeRows(result.values)
      .map(row => toHistoryEntry(row))
      .filter((entry): entry is PersistedHistoryEntry => entry !== null);
  }
}

function readLocalPreferences(): PersistedPreferences {
  const storedValue = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);

  if (!storedValue) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_PREFERENCES;
    }

    const candidate = parsed as Record<string, unknown>;
    const language = candidate.language;
    const theme = candidate.theme;

    return {
      language: typeof language === "string" ? normalizeLocale(language) : DEFAULT_PREFERENCES.language,
      theme: isApplicationTheme(theme) ? theme : DEFAULT_PREFERENCES.theme
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function readLocalHistoryEntries(): ReadonlyArray<PersistedHistoryEntry> {
  const storedValue = window.localStorage.getItem(HISTORY_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(item => toHistoryEntry(item))
      .filter((entry): entry is PersistedHistoryEntry => entry !== null);
  } catch {
    return [];
  }
}

function readNativeRows(values: unknown[] | undefined): ReadonlyArray<Record<string, unknown>> {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is Record<string, unknown> => (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
  ));
}

function toHistoryEntry(value: unknown): PersistedHistoryEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const character = candidate.character;
  const category = candidate.category;
  const createdAt = candidate.createdAt ?? candidate.created_at;
  const summary = candidate.summary;

  if (
    typeof character !== "string" ||
    typeof category !== "string" ||
    typeof createdAt !== "string" ||
    typeof summary !== "string" ||
    !isHistoryCategory(category)
  ) {
    return null;
  }

  return {
    character,
    category,
    createdAt,
    summary
  };
}

function isHistoryCategory(category: string): category is HistoryCategory {
  return HISTORY_CATEGORIES.includes(category as HistoryCategory);
}

function isApplicationTheme(theme: unknown): theme is ApplicationTheme {
  return theme === "light" || theme === "dark" || theme === "system";
}
