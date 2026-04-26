import type { SQLValue } from "@capgo/capacitor-fast-sql";

import type { ApplicationTheme, HistoryCategory, HistoryGroup } from "../DomainTypes";
import { openMutableUserDatabase, type MutableUserDatabase } from "../Database/MutableUserDatabase";

const HISTORY_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];
const CURRENT_PREFERENCES_ID = "current";
const DEFAULT_LANGUAGE = "en-US";
const DEFAULT_THEME: ApplicationTheme = "system";

/**
 * User-owned persistent data repository.
 *
 * @inv All records are stored in the mutable SQLite database.
 */
export interface UserDataRepository {
  /**
   * Initializes the mutable schema.
   *
   * @post Required user tables exist.
   */
  initialize(): Promise<void>;

  /**
   * Loads persisted preferences.
   *
   * @post Missing preferences return defaults.
   */
  loadPreferences(): Promise<{ language: string; theme: ApplicationTheme }>;

  /**
   * Saves user preferences.
   *
   * @pre language and theme are supported by application policy.
   * @post Preferences are stored in SQLite.
   */
  savePreferences(language: string, theme: ApplicationTheme): Promise<void>;

  /**
   * Loads grouped history.
   *
   * @post All supported categories are present in the returned collection.
   */
  loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>>;

  /**
   * Saves or refreshes a history entry.
   *
   * @pre character and category are valid.
   * @post At most one record exists for the character-category pair.
   */
  saveHistoryEntry(character: string, category: HistoryCategory, createdAt: string): Promise<void>;
}

/**
 * Creates the SQLite-backed user data repository.
 *
 * @returns Persistent repository.
 */
export function createUserDataRepository(): UserDataRepository {
  let databasePromise: Promise<MutableUserDatabase> | null = null;

  async function getDatabase(): Promise<MutableUserDatabase> {
    if (databasePromise === null) {
      databasePromise = openMutableUserDatabase();
    }

    return databasePromise;
  }

  return {
    async initialize(): Promise<void> {
      const database = await getDatabase();
      await database.run(`
        CREATE TABLE IF NOT EXISTS history_entries (
          character TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TEXT NOT NULL,
          PRIMARY KEY (character, category)
        )
      `);
      await database.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id TEXT PRIMARY KEY NOT NULL,
          language TEXT NOT NULL,
          theme TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
    },
    async loadPreferences(): Promise<{ language: string; theme: ApplicationTheme }> {
      const database = await getDatabase();
      const rows = await database.query(
        "SELECT language, theme FROM user_preferences WHERE id = ?",
        [CURRENT_PREFERENCES_ID]
      );

      if (rows.length === 0) {
        return {
          language: DEFAULT_LANGUAGE,
          theme: DEFAULT_THEME
        };
      }

      return {
        language: getString(rows[0], "language", DEFAULT_LANGUAGE),
        theme: getTheme(rows[0], "theme")
      };
    },
    async savePreferences(language: string, theme: ApplicationTheme): Promise<void> {
      const database = await getDatabase();
      await database.run(
        `INSERT INTO user_preferences (id, language, theme, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           language = excluded.language,
           theme = excluded.theme,
           updated_at = excluded.updated_at`,
        [CURRENT_PREFERENCES_ID, language, theme, new Date().toISOString()]
      );
    },
    async loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
      const database = await getDatabase();
      const rows = await database.query(
        `SELECT character, category, created_at
         FROM history_entries
         ORDER BY created_at DESC`,
        []
      );

      return HISTORY_CATEGORIES.map(category => ({
        category,
        entries: rows
          .filter(row => getString(row, "category", "") === category)
          .map(row => ({
            character: getString(row, "character", ""),
            createdAt: getString(row, "created_at", ""),
            summary: getString(row, "character", "")
          }))
          .filter(entry => entry.character.length > 0 && entry.createdAt.length > 0)
      }));
    },
    async saveHistoryEntry(character: string, category: HistoryCategory, createdAt: string): Promise<void> {
      const database = await getDatabase();
      await database.run(
        `INSERT INTO history_entries (character, category, created_at)
         VALUES (?, ?, ?)
         ON CONFLICT(character, category) DO UPDATE SET created_at = excluded.created_at`,
        [character, category, createdAt]
      );
    }
  };
}

function getString(row: Readonly<Record<string, SQLValue>>, key: string, fallback: string): string {
  const value = row[key];

  return typeof value === "string" ? value : fallback;
}

function getTheme(row: Readonly<Record<string, SQLValue>>, key: string): ApplicationTheme {
  const value = getString(row, key, DEFAULT_THEME);

  return value === "light" || value === "dark" || value === "system" ? value : DEFAULT_THEME;
}
