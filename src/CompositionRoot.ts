import packageMetadata from "../package.json";

import { AppPersistence } from "./Shared/AppPersistence";
import type { AboutInformationItem, ApplicationTheme, DetailedKanjiEntry, HistoryCategory, HistoryGroup } from "./Shared/DomainTypes";
import { getMeaningLanguagePriority, normalizeLocale, translate, type SupportedLocale } from "./Shared/I18n";
import { KanjiRepository, type KanjiSummary, type SourceAttribution } from "./Shared/KanjiRepository";
import { OcrWorkerClient } from "./Shared/OcrWorkerClient";
import type { AboutInterface } from "./Features/About/Contracts/AboutInterface";
import { CreateAboutController } from "./Features/About/CreateAboutController";
import type { UserPreferenceInterface } from "./Features/Preferences/Contracts/UserPreferenceInterface";
import { CreateUserPreferenceController } from "./Features/Preferences/CreateUserPreferenceController";
import type { NavigationInterface } from "./Features/Shell/Contracts/NavigationInterface";
import { CreateNavigationController } from "./Features/Shell/CreateNavigationController";
import type { SearchInterface } from "./Features/Search/Contracts/SearchInterface";
import { CreateSearchController } from "./Features/Search/CreateSearchController";
import type { HistoryInterface } from "./Features/History/Contracts/HistoryInterface";
import { CreateHistoryController } from "./Features/History/CreateHistoryController";
import type { NavigationPage } from "./Shared/DomainTypes";

export interface AboutDisplayItem {
  readonly label: string;
  readonly value: string;
}

export interface ApplicationPreferences {
  readonly language: SupportedLocale;
  readonly theme: ApplicationTheme;
}

let navigationDelegate: ((page: NavigationPage) => void) | null = null;
let preferenceDelegate: ((preferences: ApplicationPreferences) => void) | null = null;

export interface CompositionRoot {
  readonly kanjiRepository: KanjiRepository;
  readonly persistence: AppPersistence;
  readonly ocrClient: OcrWorkerClient;
  initialize(): Promise<ApplicationPreferences>;
  loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>>;
  loadKanjiDetails(character: string, language: string, recordVisit?: boolean): Promise<DetailedKanjiEntry>;
  readonly aboutController: AboutInterface;
  readonly userPreferenceController: UserPreferenceInterface;
  readonly navigationController: NavigationInterface;
  readonly searchController: SearchInterface;
  readonly historyController: HistoryInterface;
  registerNavigationDelegate(delegate: (page: NavigationPage) => void): void;
  registerPreferenceDelegate(delegate: (preferences: ApplicationPreferences) => void): void;
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

  const userPreferenceController = CreateUserPreferenceController({
    applyLanguage: async (language: string) => {
      const preferences = await persistence.getPreferences();
      const nextPreferences = { ...preferences, language: normalizeLocale(language) };
      await persistence.savePreferences(nextPreferences);
      preferenceDelegate?.(nextPreferences);
    },
    applyTheme: async (theme: ApplicationTheme) => {
      const preferences = await persistence.getPreferences();
      const nextPreferences = { ...preferences, theme };
      await persistence.savePreferences(nextPreferences);
      preferenceDelegate?.(nextPreferences);
    }
  });

  const navigationController = CreateNavigationController({
    clearPageState: (page: NavigationPage) => {
      navigationDelegate?.(page);
    },
    publishInitialRoute: () => {
      // Logic for publishing initial route if needed
    }
  });

  const historyController = CreateHistoryController({
    loadGroups: () => persistence.loadHistoryGroups(),
    persistEntry: async (entry) => {
      const summary = await kanjiRepository.getSummary(entry.character);
      await persistence.saveHistoryEntry({
        ...entry,
        summary: summary ? createHistorySummary(summary) : entry.character
      });
    },
    navigateToKanjiEntry: async (character: string) => {
      navigationDelegate?.("kanjiEntry");
    }
  });

  const searchController = CreateSearchController({
    queryTerm: (term: string) => kanjiRepository.search(term),
    historyController,
    navigateToKanjiEntry: async (character: string) => {
      navigationDelegate?.("kanjiEntry");
    }
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
      const locale = normalizeLocale(preferences.language);

      userPreferenceController.setLanguage(locale);
      userPreferenceController.setTheme(preferences.theme);

      return {
        language: locale,
        theme: preferences.theme
      };
    },
    loadHistoryGroups(): Promise<ReadonlyArray<HistoryGroup>> {
      return persistence.loadHistoryGroups();
    },
    async loadKanjiDetails(character: string, language: string): Promise<DetailedKanjiEntry> {
      const details = await kanjiRepository.getDetails(character);

      return {
        ...details,
        meanings: filterMeaningsByLanguage(details.meanings ?? [], language)
      };
    },
    aboutController,
    userPreferenceController,
    navigationController,
    searchController,
    historyController,
    registerNavigationDelegate(delegate: (page: NavigationPage) => void): void {
      navigationDelegate = delegate;
    },
    registerPreferenceDelegate(delegate: (preferences: ApplicationPreferences) => void): void {
      preferenceDelegate = delegate;
    },
    savePreferences(preferences: ApplicationPreferences): Promise<void> {
      return persistence.savePreferences(preferences);
    }
  };
}

function createHistorySummary(summary: KanjiSummary): string {
  const onyomi = summary.primaryReadings.filter(r => !r.match(/^[あ-ん]/)).slice(0, 3);
  const kunyomi = summary.primaryReadings.filter(r => r.match(/^[あ-ん]/)).slice(0, 3);

  const onText = onyomi.join("・");
  const kunText = kunyomi.join("・");

  if (onText && kunText) {
    return `${onText}・${kunText}`;
  }
  return onText || kunText || summary.character;
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
