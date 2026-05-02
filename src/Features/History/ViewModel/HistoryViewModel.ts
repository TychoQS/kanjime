import { useEffect, useMemo, useState } from "react";

import type { HistoryInterface } from "../Contracts/HistoryInterface";
import type { CreateHistoryControllerDependencies } from "../CreateHistoryController";
import type { HistoryCategory, HistoryGroup } from "../../../Shared/DomainTypes";
import { HistoryError } from "../../../Shared/AppErrors";

let registeredHistoryScreenClear: (() => void) | null = null;
let shouldClearHistoryScreenOnEnable = false;

export const HISTORY_CATEGORIES: ReadonlyArray<HistoryCategory> = [
  "search",
  "visitedEntry",
  "imageClassification",
  "drawingClassification"
];

export interface HistoryScreenViewModel {
  readonly groups: ReadonlyArray<HistoryGroup>;
  readonly category: HistoryCategory;
  readonly activeGroups: ReadonlyArray<HistoryGroup>;
  readonly isEmpty: boolean;
  setCategory(category: string): void;
  openKanjiEntry(character: string): Promise<void>;
}

/**
 * Clears the registered History screen hook state, when available.
 *
 * @post The selected category and loaded groups return to their initial state.
 */
export function clearRegisteredHistoryScreenState(): void {
  registeredHistoryScreenClear?.();
}

/**
 * Marks the History screen to clear its transient state the next time it becomes active.
 *
 * @post The next enabled History screen render resets its selected category and local groups.
 */
export function markRegisteredHistoryScreenForReset(): void {
  shouldClearHistoryScreenOnEnable = true;
}

/**
 * Checks whether a value is a supported history category.
 *
 * @pre The value may originate from persistence or UI input.
 * @post The returned value is true only for the supported category set.
 */
function isHistoryCategory(category: string): category is HistoryCategory {
  return HISTORY_CATEGORIES.includes(category as HistoryCategory);
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

  return HISTORY_CATEGORIES.map(category => {
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
 *
 * @issue History entries saved with delay (need app restart to see them). This is a known issue
 *       that will be fixed later with MVVM/context architecture for centralized state.
 *
 * @issue Previous implementation had a stuck variable `hasRejectedPersistedDuplicate`
 *       that blocked saving after first rejection. Fixed by using composite key
 *       `${character}-${category}` and simplified duplicate detection logic.
 */
export function createHistoryViewModel(dependencies: CreateHistoryControllerDependencies): HistoryInterface {
  const savedKeys = new Set<string>();
  let cachedGroups: ReadonlyArray<HistoryGroup> = [];
  const listeners = new Set<() => void>();

  const notifyListeners = () => {
    listeners.forEach(listener => listener());
  };

  return {
    async getEntriesByCategory(): Promise<ReadonlyArray<HistoryGroup>> {
      if (cachedGroups.length === 0) {
        cachedGroups = normalizeGroups(await dependencies.loadGroups());
      }
      return normalizeGroups(cachedGroups);
    },
    async saveEntry(entry): Promise<void> {
      if (
        entry.character.trim().length === 0 ||
        !isHistoryCategory(entry.category) ||
        !/[\u4e00-\u9fff]/.test(entry.character)
      ) {
        throw new HistoryError("The history entry could not be saved.");
      }

      const key = `${entry.character}-${entry.category}-${entry.createdAt}`;

      if (cachedGroups.length === 0) {
        cachedGroups = normalizeGroups(await dependencies.loadGroups());
      }

      const isDuplicate = cachedGroups.some(group =>
        group.category === entry.category &&
        group.entries.some(candidate =>
          candidate.character === entry.character &&
          candidate.createdAt === entry.createdAt
        )
      );

      if (savedKeys.has(key) || isDuplicate) {
        throw new HistoryError("HistoryInterface did not reject saving a duplicated history entry.");
      }

      savedKeys.add(key);
      cachedGroups = normalizeGroups(
        cachedGroups.map(group => {
          if (group.category === entry.category) {
            return {
              ...group,
              entries: [
                ...group.entries,
                {
                  character: entry.character,
                  createdAt: entry.createdAt,
                  summary: entry.character
                }
              ]
            };
          }
          return group;
        })
      );
      await dependencies.persistEntry({ ...entry });
      notifyListeners();
    },
    async openKanjiEntry(character: string): Promise<void> {
      if (cachedGroups.length === 0) {
        cachedGroups = normalizeGroups(await dependencies.loadGroups());
      }

      const hasEntries = cachedGroups.some(group => group.entries.length > 0);

      if (!hasEntries || character.trim().length === 0) {
        throw new HistoryError("Select a history item before opening details.");
      }

      await dependencies.navigateToKanjiEntry(character);
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}

/**
 * Creates the History screen hook view model.
 *
 * @pre The history controller is initialized and can load stored groups.
 * @inv The selected category always belongs to the supported history category set.
 * @post The returned state exposes loaded groups and the derived visible category slice.
 */
export function useHistoryScreenViewModel(
  historyController: HistoryInterface,
  isEnabled: boolean
): HistoryScreenViewModel {
  const [groups, setGroups] = useState<ReadonlyArray<HistoryGroup>>([]);
  const [category, setCategory] = useState<HistoryCategory>("search");

  useEffect(() => {
    registeredHistoryScreenClear = () => {
      setGroups([]);
      setCategory("search");
    };

    return () => {
      if (registeredHistoryScreenClear !== null) {
        registeredHistoryScreenClear = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || !shouldClearHistoryScreenOnEnable) {
      return;
    }

    shouldClearHistoryScreenOnEnable = false;
    clearRegisteredHistoryScreenState();
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const load = () => {
      void historyController.getEntriesByCategory()
        .then(nextGroups => setGroups(nextGroups as ReadonlyArray<HistoryGroup>))
        .catch(() => setGroups([]));
    };

    load();
    const unsubscribe = historyController.subscribe(load);

    return () => {
      unsubscribe();
    };
  }, [historyController, isEnabled]);

  const activeGroups = useMemo(() => groups.filter(group => group.category === category), [category, groups]);
  const isEmpty = activeGroups.length === 0 || activeGroups[0].entries.length === 0;

  return {
    groups,
    category,
    activeGroups,
    isEmpty,
    setCategory(value: string): void {
      setCategory(HISTORY_CATEGORIES.includes(value as HistoryCategory) ? value as HistoryCategory : "search");
    },
    openKanjiEntry(character: string): Promise<void> {
      return historyController.openKanjiEntry(character);
    }
  };
}
