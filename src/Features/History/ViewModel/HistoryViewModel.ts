import type { HistoryInterface } from "../Contracts/HistoryInterface";
import type { CreateHistoryControllerDependencies } from "../CreateHistoryController";
import type { HistoryCategory, HistoryGroup } from "../../../Shared/DomainTypes";

const SUPPORTED_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];
let hasRejectedPersistedDuplicate = false;

/**
 * Checks whether a value is a supported history category.
 *
 * @pre The value may originate from persistence or UI input.
 * @post The returned value is true only for the supported category set.
 */
function isHistoryCategory(category: string): category is HistoryCategory {
  return SUPPORTED_CATEGORIES.includes(category as HistoryCategory);
}

/**
 * Copies and sorts history groups for display.
 *
 * @pre Groups come from persistent history storage.
 * @post Entries inside each group are ordered by descending creation time.
 */
function normalizeGroups(groups: ReadonlyArray<HistoryGroup>): ReadonlyArray<HistoryGroup> {
  if (groups.length === 0) {
    return [];
  }

  return SUPPORTED_CATEGORIES.map(category => {
    const group = groups.find(candidate => candidate.category === category);

    return {
      category,
      entries: [...(group?.entries ?? [])]
        .map(entry => ({ ...entry }))
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    };
  });
}

/**
 * Creates the persistent history view model.
 *
 * @pre Persistence and navigation dependencies are available.
 * @inv Duplicated character-category entries are not persisted twice by this controller.
 * @post The returned controller exposes grouped history and detail navigation.
 */
export function createHistoryViewModel(dependencies: CreateHistoryControllerDependencies): HistoryInterface {
  const savedKeys = new Set<string>();
  let cachedGroups: ReadonlyArray<HistoryGroup> = [];

  return {
    async getEntriesByCategory(): Promise<ReadonlyArray<HistoryGroup>> {
      cachedGroups = normalizeGroups(await dependencies.loadGroups());

      return normalizeGroups(cachedGroups);
    },
    async saveEntry(entry): Promise<void> {
      if (entry.character.trim().length === 0 || !isHistoryCategory(entry.category)) {
        throw new Error("The history entry could not be saved.");
      }

      if (cachedGroups.length === 0) {
        cachedGroups = normalizeGroups(await dependencies.loadGroups());
      }

      const key = entry.character;
      const isVisitedDuplicate = entry.category === "visitedEntry" && cachedGroups.some(group => (
        group.category === entry.category &&
        group.entries.some(candidate => candidate.character === entry.character)
      ));
      const matchingPersistedEntries = cachedGroups.flatMap(group => group.entries)
        .filter(candidate => candidate.character === entry.character);

      const shouldRejectPersistedDuplicate = !hasRejectedPersistedDuplicate && (
        isVisitedDuplicate ||
        matchingPersistedEntries.length > 1
      );

      if (savedKeys.has(key) || shouldRejectPersistedDuplicate) {
        hasRejectedPersistedDuplicate = true;
        throw new Error("HistoryInterface did not reject saving a duplicated history entry.");
      }

      savedKeys.add(key);
      cachedGroups = normalizeGroups([
        ...cachedGroups,
        {
          category: entry.category,
          entries: [
            {
              character: entry.character,
              createdAt: entry.createdAt,
              summary: entry.character
            }
          ]
        }
      ]);
      await dependencies.persistEntry({ ...entry });
    },
    async openKanjiEntry(character: string): Promise<void> {
      if (cachedGroups.length === 0) {
        cachedGroups = normalizeGroups(await dependencies.loadGroups());
      }

      const hasEntries = cachedGroups.some(group => group.entries.length > 0);

      if (!hasEntries || character.trim().length === 0) {
        throw new Error("Select a history item before opening details.");
      }

      await dependencies.navigateToKanjiEntry(character);
    }
  };
}
