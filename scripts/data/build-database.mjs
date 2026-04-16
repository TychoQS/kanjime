import { resolve } from "node:path";
import initSqlJs from "sql.js";
import { XMLParser } from "fast-xml-parser";

import {
  ensureDirectory,
  PATHS,
  readJsonFile,
  readTextFile,
  writeBinaryFile,
  writeJsonFile
} from "./file-system.mjs";

const DATABASE_SCHEMA_VERSION = 1;
const MAX_READING_EXAMPLES = 5;

/**
 * Writes a status line to stdout.
 *
 * @param {string} message User-facing status line.
 * @returns {void}
 */
function writeStatus(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Wraps a value in an array when needed.
 *
 * @template T
 * @param {T | ReadonlyArray<T> | undefined | null} value Source value.
 * @returns {ReadonlyArray<T>}
 *
 * @post The returned value is always an array.
 */
function toArray(value) {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

/**
 * Extracts text from XML parser output.
 *
 * @param {unknown} value Parsed XML value.
 * @returns {string}
 *
 * @post A trimmed textual representation is returned or an empty string.
 */
function getText(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "text" in value) {
    const textValue = value.text;

    if (typeof textValue === "string") {
      return textValue.trim();
    }

    if (typeof textValue === "number") {
      return String(textValue);
    }
  }

  return "";
}

/**
 * Creates a parser configured for JMdict and KANJIDIC2.
 *
 * @returns {XMLParser}
 *
 * @post The parser preserves XML attributes using plain property names.
 */
function createXmlParser() {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "text",
    trimValues: true,
    processEntities: false
  });
}

/**
 * Normalizes a KANJIDIC reading before matching it with JMdict examples.
 *
 * @param {string} reading Reading value.
 * @returns {string}
 *
 * @post The returned value is suitable for lenient reading comparison.
 */
function normalizeReading(reading) {
  return reading.replaceAll(".", "").replaceAll("-", "").trim();
}

/**
 * Returns whether two readings should be considered equivalent for example extraction.
 *
 * @param {string} kanjidicReading Reading declared in KANJIDIC2.
 * @param {string} jmdictReading Reading declared in JMdict.
 * @returns {boolean}
 */
function readingsMatch(kanjidicReading, jmdictReading) {
  const normalizedKanjidicReading = normalizeReading(kanjidicReading);
  const normalizedJmdictReading = normalizeReading(jmdictReading);

  if (normalizedKanjidicReading.length === 0 || normalizedJmdictReading.length === 0) {
    return false;
  }

  return (
    normalizedKanjidicReading === normalizedJmdictReading ||
    normalizedJmdictReading.startsWith(normalizedKanjidicReading) ||
    normalizedKanjidicReading.startsWith(normalizedJmdictReading)
  );
}

/**
 * Parses KANJIDIC2 into a character-keyed map.
 *
 * @param {string} xmlContents Expanded KANJIDIC2 XML.
 * @param {ReadonlySet<string>} targetCharacters Characters allowed by the classifier.
 * @returns {Map<string, {
 *   character: string;
 *   radical: string;
 *   strokeCount: number;
 *   jlptLevel: string | null;
 *   joyoLevel: string | null;
 *   meanings: Array<{ language: string; value: string }>;
 *   kunyomi: string[];
 *   onyomi: string[];
 * }>}
 */
function parseKanjidic(xmlContents, targetCharacters) {
  const document = createXmlParser().parse(xmlContents);
  const parsedEntries = toArray(document?.kanjidic2?.character);
  const kanjiMap = new Map();

  for (const parsedEntry of parsedEntries) {
    const character = getText(parsedEntry.literal);

    if (!targetCharacters.has(character)) {
      continue;
    }

    const radicals = toArray(parsedEntry?.radical?.rad_value);
    const classicalRadical = radicals.find((radicalValue) => {
      return typeof radicalValue === "object" && radicalValue !== null && radicalValue.rad_type === "classical";
    });

    const strokeCount = Number.parseInt(getText(toArray(parsedEntry?.misc?.stroke_count)[0]), 10);

    if (!classicalRadical || Number.isNaN(strokeCount)) {
      throw new Error(`Missing radical or stroke count for ${character}.`);
    }

    const meanings = [];
    const kunyomi = new Set();
    const onyomi = new Set();

    for (const readingGroup of toArray(parsedEntry?.reading_meaning?.rmgroup)) {
      for (const meaning of toArray(readingGroup?.meaning)) {
        const language =
          typeof meaning === "object" && meaning !== null && typeof meaning.m_lang === "string" ? meaning.m_lang : "en";
        const value = getText(meaning);

        if (value.length > 0) {
          meanings.push({ language, value });
        }
      }

      for (const reading of toArray(readingGroup?.reading)) {
        if (!reading || typeof reading !== "object") {
          continue;
        }

        const readingValue = getText(reading);

        if (reading.r_type === "ja_kun" && readingValue.length > 0) {
          kunyomi.add(readingValue);
        }

        if (reading.r_type === "ja_on" && readingValue.length > 0) {
          onyomi.add(readingValue);
        }
      }
    }

    kanjiMap.set(character, {
      character,
      radical: getText(classicalRadical),
      strokeCount,
      jlptLevel: getText(parsedEntry?.misc?.jlpt) || null,
      joyoLevel: getText(parsedEntry?.misc?.grade) || null,
      meanings,
      kunyomi: [...kunyomi],
      onyomi: [...onyomi]
    });
  }

  return kanjiMap;
}

/**
 * Parses JMdict into a map of candidate examples grouped by character.
 *
 * @param {string} xmlContents Expanded JMdict XML.
 * @param {ReadonlySet<string>} targetCharacters Characters allowed by the classifier.
 * @returns {Map<string, Array<{ headword: string; readings: string[] }>>}
 */
function parseJmdict(xmlContents, targetCharacters) {
  const document = createXmlParser().parse(xmlContents);
  const parsedEntries = toArray(document?.JMdict?.entry);
  const exampleMap = new Map();

  for (const parsedEntry of parsedEntries) {
    const spellings = toArray(parsedEntry?.k_ele)
      .map((spelling) => getText(spelling?.keb))
      .filter((spelling) => spelling.length > 0);
    const readings = toArray(parsedEntry?.r_ele)
      .map((reading) => getText(reading?.reb))
      .filter((reading) => reading.length > 0);
    const headword = spellings[0] ?? readings[0] ?? "";

    if (headword.length === 0) {
      continue;
    }

    const seenCharacters = new Set();

    for (const character of headword) {
      if (!targetCharacters.has(character) || seenCharacters.has(character)) {
        continue;
      }

      seenCharacters.add(character);

      const existingExamples = exampleMap.get(character) ?? [];
      existingExamples.push({
        headword,
        readings
      });
      exampleMap.set(character, existingExamples);
    }
  }

  return exampleMap;
}

/**
 * Parses KanjiVG into a map of SVG fragments and component lists.
 *
 * @param {string} xmlContents Expanded KanjiVG XML.
 * @param {ReadonlySet<string>} targetCharacters Characters allowed by the classifier.
 * @returns {Map<string, { components: string[]; strokeOrderSvg: string }>}
 */
function parseKanjiVg(xmlContents, targetCharacters) {
  const kanjiMap = new Map();
  const kanjiEntryPattern = /<kanji\b[^>]*id="kvg:kanji_([0-9A-Fa-f]{4,6})"[^>]*>[\s\S]*?<\/kanji>/g;

  for (const matchedKanji of xmlContents.matchAll(kanjiEntryPattern)) {
    const codePointValue = Number.parseInt(matchedKanji[1], 16);
    const character = String.fromCodePoint(codePointValue);

    if (!targetCharacters.has(character)) {
      continue;
    }

    const strokeOrderSvg = matchedKanji[0];
    const componentMatches = strokeOrderSvg.matchAll(/(?:kvg:)?element="([^"]+)"/g);
    const components = [...new Set([...componentMatches].map((componentMatch) => componentMatch[1]).filter(Boolean))];

    kanjiMap.set(character, {
      components,
      strokeOrderSvg
    });
  }

  return kanjiMap;
}

/**
 * Selects matching examples for a concrete reading.
 *
 * @param {Array<{ headword: string; readings: string[] }>} examples Candidate examples for the character.
 * @param {string} reading Reading declared in KANJIDIC2.
 * @returns {string[]}
 */
function selectReadingExamples(examples, reading) {
  const matchedExamples = [];
  const seenHeadwords = new Set();

  for (const example of examples) {
    if (seenHeadwords.has(example.headword)) {
      continue;
    }

    const matchesReading = example.readings.some((exampleReading) => readingsMatch(reading, exampleReading));

    if (!matchesReading) {
      continue;
    }

    matchedExamples.push(example.headword);
    seenHeadwords.add(example.headword);

    if (matchedExamples.length >= MAX_READING_EXAMPLES) {
      break;
    }
  }

  return matchedExamples;
}

/**
 * Loads the SQL.js runtime.
 *
 * @returns {Promise<import("sql.js").SqlJsStatic>}
 */
async function loadSqlJs() {
  return initSqlJs({
    locateFile: (file) => resolve(PATHS.projectRoot, "node_modules", "sql.js", "dist", file)
  });
}

/**
 * Inserts a table row using a prepared statement.
 *
 * @param {import("sql.js").Statement} statement Prepared statement.
 * @param {ReadonlyArray<string | number | null>} values Values bound to the statement.
 * @returns {void}
 */
function runStatement(statement, values) {
  statement.run(values);
  statement.reset();
}

/**
 * Builds the packaged database and metadata artifacts.
 *
 * @returns {Promise<void>}
 */
async function buildPackagedDatabase() {
  const downloadedManifest = /** @type {{ generatedAt: string; sources: Array<{ id: string; expandedFilePath: string; downloadUrl: string; attribution: string; homepage: string; license: string; upstreamVersion: string | null; downloadedAt: string; expandedSha256: string }> }} */ (
    await readJsonFile(PATHS.downloadManifestFile)
  );
  const modelClasses = /** @type {string[]} */ (await readJsonFile(PATHS.modelClassesFile));
  const targetCharacters = new Set(modelClasses);

  const kanjidicSource = downloadedManifest.sources.find((source) => source.id === "kanjidic2");
  const jmdictSource = downloadedManifest.sources.find((source) => source.id === "jmdict");
  const kanjiVgSource = downloadedManifest.sources.find((source) => source.id === "kanjivg");

  if (!kanjidicSource || !jmdictSource || !kanjiVgSource) {
    throw new Error("The download manifest does not contain all required sources.");
  }

  writeStatus("Parsing downloaded sources...");

  const [kanjidicXml, jmdictXml, kanjiVgXml] = await Promise.all([
    readTextFile(kanjidicSource.expandedFilePath),
    readTextFile(jmdictSource.expandedFilePath),
    readTextFile(kanjiVgSource.expandedFilePath)
  ]);

  const kanjidicEntries = parseKanjidic(kanjidicXml, targetCharacters);
  const jmdictExamples = parseJmdict(jmdictXml, targetCharacters);
  const kanjiVgEntries = parseKanjiVg(kanjiVgXml, targetCharacters);

  writeStatus("Building SQLite database...");

  const sqlJs = await loadSqlJs();
  const database = new sqlJs.Database();

  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE source_attributions (
      source_id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      homepage TEXT NOT NULL,
      download_url TEXT NOT NULL,
      license TEXT NOT NULL,
      attribution TEXT NOT NULL,
      upstream_version TEXT,
      downloaded_at TEXT NOT NULL,
      expanded_sha256 TEXT NOT NULL
    );

    CREATE TABLE kanji_entries (
      character TEXT PRIMARY KEY NOT NULL,
      radical TEXT NOT NULL,
      components_json TEXT NOT NULL,
      stroke_count INTEGER NOT NULL,
      stroke_order_svg TEXT NOT NULL,
      jlpt_level TEXT,
      joyo_level TEXT
    );

    CREATE TABLE kanji_meanings (
      character TEXT NOT NULL,
      language TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (character, language, value),
      FOREIGN KEY (character) REFERENCES kanji_entries(character) ON DELETE CASCADE
    );

    CREATE TABLE kanji_readings (
      character TEXT NOT NULL,
      reading_type TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (character, reading_type, value),
      FOREIGN KEY (character) REFERENCES kanji_entries(character) ON DELETE CASCADE
    );

    CREATE TABLE kanji_examples (
      character TEXT NOT NULL,
      reading_type TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (character, reading_type, value),
      FOREIGN KEY (character) REFERENCES kanji_entries(character) ON DELETE CASCADE
    );

    CREATE INDEX idx_kanji_readings_type_value ON kanji_readings(reading_type, value);
    CREATE INDEX idx_kanji_examples_type_value ON kanji_examples(reading_type, value);
    CREATE INDEX idx_kanji_meanings_language_value ON kanji_meanings(language, value);
  `);

  const insertMetadataStatement = database.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)");
  const insertSourceStatement = database.prepare(`
    INSERT INTO source_attributions (
      source_id,
      display_name,
      homepage,
      download_url,
      license,
      attribution,
      upstream_version,
      downloaded_at,
      expanded_sha256
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEntryStatement = database.prepare(`
    INSERT INTO kanji_entries (
      character,
      radical,
      components_json,
      stroke_count,
      stroke_order_svg,
      jlpt_level,
      joyo_level
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMeaningStatement = database.prepare("INSERT INTO kanji_meanings (character, language, value) VALUES (?, ?, ?)");
  const insertReadingStatement = database.prepare("INSERT INTO kanji_readings (character, reading_type, value) VALUES (?, ?, ?)");
  const insertExampleStatement = database.prepare("INSERT INTO kanji_examples (character, reading_type, value) VALUES (?, ?, ?)");

  const buildTimestamp = new Date().toISOString();

  runStatement(insertMetadataStatement, ["schemaVersion", String(DATABASE_SCHEMA_VERSION)]);
  runStatement(insertMetadataStatement, ["builtAt", buildTimestamp]);
  runStatement(insertMetadataStatement, ["classCount", String(modelClasses.length)]);

  for (const source of downloadedManifest.sources) {
    runStatement(insertSourceStatement, [
      source.id,
      source.id === "kanjidic2" ? "KANJIDIC2" : source.id === "jmdict" ? "JMdict" : "KanjiVG",
      source.homepage,
      source.downloadUrl,
      source.license,
      source.attribution,
      source.upstreamVersion,
      source.downloadedAt,
      source.expandedSha256
    ]);
  }

  for (const character of modelClasses) {
    const kanjidicEntry = kanjidicEntries.get(character);
    const kanjiVgEntry = kanjiVgEntries.get(character);

    if (!kanjidicEntry) {
      throw new Error(`No KANJIDIC2 entry was found for classifier class ${character}.`);
    }

    if (!kanjiVgEntry) {
      throw new Error(`No KanjiVG entry was found for classifier class ${character}.`);
    }

    const candidateExamples = jmdictExamples.get(character) ?? [];
    const kunyomiExamples = kanjidicEntry.kunyomi.flatMap((reading) => selectReadingExamples(candidateExamples, reading));
    const onyomiExamples = kanjidicEntry.onyomi.flatMap((reading) => selectReadingExamples(candidateExamples, reading));

    runStatement(insertEntryStatement, [
      character,
      kanjidicEntry.radical,
      JSON.stringify(kanjiVgEntry.components),
      kanjidicEntry.strokeCount,
      kanjiVgEntry.strokeOrderSvg,
      kanjidicEntry.jlptLevel,
      kanjidicEntry.joyoLevel
    ]);

    for (const meaning of kanjidicEntry.meanings) {
      runStatement(insertMeaningStatement, [character, meaning.language, meaning.value]);
    }

    for (const reading of kanjidicEntry.kunyomi) {
      runStatement(insertReadingStatement, [character, "kunyomi", reading]);
    }

    for (const reading of kanjidicEntry.onyomi) {
      runStatement(insertReadingStatement, [character, "onyomi", reading]);
    }

    for (const example of [...new Set(kunyomiExamples)].slice(0, MAX_READING_EXAMPLES)) {
      runStatement(insertExampleStatement, [character, "kunyomi", example]);
    }

    for (const example of [...new Set(onyomiExamples)].slice(0, MAX_READING_EXAMPLES)) {
      runStatement(insertExampleStatement, [character, "onyomi", example]);
    }
  }

  insertMetadataStatement.free();
  insertSourceStatement.free();
  insertEntryStatement.free();
  insertMeaningStatement.free();
  insertReadingStatement.free();
  insertExampleStatement.free();

  await ensureDirectory(PATHS.publicDatabaseDirectory);
  await ensureDirectory(PATHS.publicAttributionDirectory);

  await writeBinaryFile(PATHS.packagedDatabaseFile, database.export());
  await writeJsonFile(PATHS.packagedMetadataFile, {
    schemaVersion: DATABASE_SCHEMA_VERSION,
    builtAt: buildTimestamp,
    classCount: modelClasses.length,
    packagedDatabaseAssetPath: "/assets/database/kanji.sqlite",
    sources: downloadedManifest.sources.map((source) => ({
      id: source.id,
      downloadUrl: source.downloadUrl,
      downloadedAt: source.downloadedAt,
      upstreamVersion: source.upstreamVersion,
      expandedSha256: source.expandedSha256
    }))
  });
  await writeJsonFile(PATHS.packagedAttributionFile, {
    generatedAt: buildTimestamp,
    sources: downloadedManifest.sources.map((source) => ({
      id: source.id,
      attribution: source.attribution,
      homepage: source.homepage,
      license: source.license,
      downloadUrl: source.downloadUrl,
      downloadedAt: source.downloadedAt,
      upstreamVersion: source.upstreamVersion
    }))
  });

  database.close();
  writeStatus("Packaged database generated successfully.");
}

await buildPackagedDatabase();
