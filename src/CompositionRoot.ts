import packageMetadata from "../package.json";

import { AppPersistence } from "./Shared/AppPersistence";
import type { ApplicationTheme, DetailedKanjiEntry, HistoryCategory, HistoryGroup } from "./Shared/DomainTypes";
import { getMeaningLanguagePriority, normalizeLocale, type SupportedLocale } from "./Shared/I18n";
import { KanjiRepository, type KanjiSummary, type SourceAttribution } from "./Shared/KanjiRepository";
import { OcrWorkerClient } from "./Shared/OcrWorkerClient";

export interface AboutDisplayItem {
  readonly label: string;
  readonly value: string;
}

export interface ApplicationPreferences {
  readonly language: SupportedLocale;
  readonly theme: ApplicationTheme;
}

export interface CompositionRoot {
  readonly kanjiRepository: KanjiRepository;
  readonly persistence: AppPersistence;
  readonly ocrClient: OcrWorkerClient;
  initialize(): Promise<ApplicationPreferences>;
  recordHistory(character: string, category: HistoryCategory): Promise<void>;
  loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>>;
  loadKanjiDetails(character: string, language: string, recordVisit?: boolean): Promise<DetailedKanjiEntry>;
  loadAboutItems(): Promise<ReadonlyArray<AboutDisplayItem>>;
  savePreferences(preferences: ApplicationPreferences): Promise<void>;
}

/**
 * Builds the application dependency graph.
 *
 * @pre Browser APIs and bundled offline assets are available.
 * @inv Shared contracts are consumed without changing their public signatures.
 * @post The returned root exposes repositories, persistence, OCR, and app services.
 */
export function createCompositionRoot(): CompositionRoot {
  const kanjiRepository = new KanjiRepository();
  const persistence = new AppPersistence();
  const ocrClient = new OcrWorkerClient();
  const recordHistory = async (character: string, category: HistoryCategory): Promise<void> => {
    const summary = await kanjiRepository.getSummary(character);
    await persistence.saveHistoryEntry({
      character,
      category,
      createdAt: new Date().toISOString(),
      summary: summary ? createHistorySummary(summary) : character
    });
  };

  return {
    kanjiRepository,
    persistence,
    ocrClient,
    async initialize(): Promise<ApplicationPreferences> {
      await Promise.all([
        kanjiRepository.initialize(),
        persistence.initialize(),
        ocrClient.loadModel()
      ]);
      const preferences = await persistence.getPreferences();

      return {
        language: normalizeLocale(preferences.language),
        theme: preferences.theme
      };
    },
    recordHistory,
    loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
      return persistence.loadHistoryGroups();
    },
    async loadKanjiDetails(character: string, language: string, recordVisit = true): Promise<DetailedKanjiEntry> {
      const details = await kanjiRepository.getDetails(character);

      if (recordVisit) {
        await recordHistory(character, "visitedEntry");
      }

      return {
        ...details,
        meanings: filterMeaningsByLanguage(details.meanings ?? [], language)
      };
    },
    async loadAboutItems(): Promise<ReadonlyArray<AboutDisplayItem>> {
      const [attributions] = await Promise.all([
        kanjiRepository.loadSourceAttributions()
      ]);
      const metadata = kanjiRepository.getMetadata();

      return [
        {
          label: "Version",
          value: packageMetadata.version
        },
        {
          label: "License",
          value: "Academic project. Data source licenses apply."
        },
        {
          label: "Terms of use",
          value: "Works offline and stores recognition history on this device."
        },
        {
          label: "Authorship",
          value: "Tycho Quintana Santana"
        },
        {
          label: "Model",
          value: metadata ? `${metadata.classCount} kanji classes with ONNX Runtime Web` : "ONNX Runtime Web"
        },
        {
          label: "Text conversion",
          value: "Wanakana"
        },
        {
          label: "Interface",
          value: "Ionic React and Capacitor"
        },
        ...formatAttributions(attributions)
      ];
    },
    savePreferences(preferences: ApplicationPreferences): Promise<void> {
      return persistence.savePreferences(preferences);
    }
  };
}

function createHistorySummary(summary: KanjiSummary): string {
  const readingText = summary.primaryReadings.slice(0, 2).join(" ");
  const levelText = summary.levels.join(" ");

  return [readingText, levelText].filter(value => value.length > 0).join(" · ") || summary.character;
}

function filterMeaningsByLanguage(
  meanings: ReadonlyArray<{ readonly language: string; readonly value: string }>,
  language: string
): ReadonlyArray<{ readonly language: string; readonly value: string }> {
  const priority = getMeaningLanguagePriority(language);

  for (const languageCode of priority) {
    const matchingMeanings = meanings.filter(meaning => meaning.language === languageCode);

    if (matchingMeanings.length > 0) {
      return matchingMeanings;
    }
  }

  return [];
}

function formatAttributions(attributions: ReadonlyArray<SourceAttribution>): ReadonlyArray<AboutDisplayItem> {
  return attributions.map(source => ({
    label: source.id,
    value: `${source.attribution}. ${source.license}.`
  }));
}
