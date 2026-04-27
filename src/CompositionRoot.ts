import packageMetadata from "../package.json";

import { AppPersistence } from "./Shared/AppPersistence";
import type { AboutInformationItem, ApplicationTheme, DetailedKanjiEntry, HistoryCategory, HistoryGroup } from "./Shared/DomainTypes";
import { getMeaningLanguagePriority, normalizeLocale, translate, type SupportedLocale } from "./Shared/I18n";
import { KanjiRepository, type KanjiSummary, type SourceAttribution } from "./Shared/KanjiRepository";
import { OcrWorkerClient } from "./Shared/OcrWorkerClient";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
import { CreateAboutController } from "./Features/About/CreateAboutController";

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
  readonly aboutController: AboutInterface;
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

  const aboutController = CreateAboutController({
    loadAboutInformation: async () => {
      const attributions = await kanjiRepository.loadSourceAttributions();
      const metadata = kanjiRepository.getMetadata();

      return [
        {
          label: "version",
          value: packageMetadata.version
        },
        {
          label: "license",
          value: "licenseDetail"
        },
        {
          label: "terms",
          value: "termsDetail"
        },
        {
          label: "authorship",
          value: "authorshipName"
        },
        {
          label: "model",
          value: metadata
            ? `__MODEL_DETAIL__:${metadata.classCount}`
            : "modelDetailEmpty"
        },
        {
          label: "textConversion",
          value: "textConversionValue"
        },
        {
          label: "interface",
          value: "interfaceValue"
        },
        ...formatAttributions(attributions)
      ];
    },
    loadApplicationVersion: async () => packageMetadata.version
  });

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
    aboutController,
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

function formatAttributions(attributions: ReadonlyArray<SourceAttribution>): ReadonlyArray<AboutInformationItem> {
  return attributions.map(source => ({
    label: source.id,
    value: `${source.attribution}. ${source.license}.`
  }));
}
