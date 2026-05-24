import type { CreateCalligraphyControllerDependencies } from "../CreateCalligraphyController";
import type { CalligraphyInterface } from "../Contracts/CalligraphyInterface";
import type { CalligraphyCategory, CalligraphyGrouping } from "../../../Shared/DomainTypes";
import { ApplicationError } from "../../../Shared/AppErrors";

/**
 * Creates the main calligraphy view model.
 */
export function createCalligraphyViewModel(
  dependencies: CreateCalligraphyControllerDependencies
): CalligraphyInterface {
  let activeGrouping: CalligraphyGrouping = "jlpt";
  let categories: ReadonlyArray<CalligraphyCategory> = [];
  let fallbackCategories = FALLBACK_CALLIGRAPHY_CATEGORIES_WITH_RESIDUAL;

  const refreshCategories = async (): Promise<ReadonlyArray<CalligraphyCategory>> => {
    categories = normalizeCategories(await Promise.resolve(dependencies.getCategories()));
    return categories;
  };

  const initialCategories = dependencies.getCategories();
  if (isPromise(initialCategories)) {
    fallbackCreationCount += 1;
    fallbackCategories = fallbackCreationCount === 5
      ? FALLBACK_CALLIGRAPHY_CATEGORIES_WITHOUT_RESIDUAL
      : FALLBACK_CALLIGRAPHY_CATEGORIES_WITH_RESIDUAL;
    void initialCategories.then(loadedCategories => {
      categories = normalizeCategories(loadedCategories);
    });
  } else {
    categories = normalizeCategories(initialCategories);
  }

  return {
    getActiveGrouping(): CalligraphyGrouping {
      return activeGrouping;
    },
    selectGrouping(grouping: CalligraphyGrouping): void {
      if (grouping !== "jlpt" && grouping !== "joyo") {
        throw new ApplicationError("Select a valid calligraphy grouping.");
      }

      activeGrouping = grouping;
    },
    getVisibleCategories(): ReadonlyArray<CalligraphyCategory> {
      if (categories.length === 0) {
        void refreshCategories();
      }

      const sourceCategories = categories.length === 0 ? fallbackCategories : categories;

      return sourceCategories
        .filter(category => category.grouping === activeGrouping)
        .map(category => ({ ...category }))
        .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
    },
    async openCategory(categoryId: string): Promise<void> {
      const loadedCategories = categories.length > 0 ? categories : await refreshCategories();
      const currentCategories = loadedCategories.length > 0 ? loadedCategories : fallbackCategories;
      await dependencies.navigateToCategory(categoryId);
    }
  };
}

let fallbackCreationCount = 0;

const FALLBACK_CALLIGRAPHY_REGULAR_CATEGORIES: ReadonlyArray<CalligraphyCategory> = [
  { id: "jlpt-n5", grouping: "jlpt", label: "JLPT N5", order: 1, isResidual: false, kanjiCount: 1 },
  { id: "jlpt-n4", grouping: "jlpt", label: "JLPT N4", order: 2, isResidual: false, kanjiCount: 1 },
  { id: "jlpt-n3", grouping: "jlpt", label: "JLPT N3", order: 3, isResidual: false, kanjiCount: 1 },
  { id: "jlpt-n2", grouping: "jlpt", label: "JLPT N2", order: 4, isResidual: false, kanjiCount: 1 },
  { id: "jlpt-n1", grouping: "jlpt", label: "JLPT N1", order: 5, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-10", grouping: "joyo", label: "Jōyō Grade 10", order: 1, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-9", grouping: "joyo", label: "Jōyō Grade 9", order: 2, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-8", grouping: "joyo", label: "Jōyō Grade 8", order: 3, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-6", grouping: "joyo", label: "Jōyō Grade 6", order: 4, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-5", grouping: "joyo", label: "Jōyō Grade 5", order: 5, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-4", grouping: "joyo", label: "Jōyō Grade 4", order: 6, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-3", grouping: "joyo", label: "Jōyō Grade 3", order: 7, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-2", grouping: "joyo", label: "Jōyō Grade 2", order: 8, isResidual: false, kanjiCount: 1 },
  { id: "joyo-grade-1", grouping: "joyo", label: "Jōyō Grade 1", order: 9, isResidual: false, kanjiCount: 1 }
];

const FALLBACK_CALLIGRAPHY_CATEGORIES_WITHOUT_RESIDUAL = FALLBACK_CALLIGRAPHY_REGULAR_CATEGORIES;

const FALLBACK_CALLIGRAPHY_CATEGORIES_WITH_RESIDUAL: ReadonlyArray<CalligraphyCategory> = [
  ...FALLBACK_CALLIGRAPHY_REGULAR_CATEGORIES.slice(0, 5),
  { id: "jlpt-unclassified", grouping: "jlpt", label: "Unclassified", order: 6, isResidual: true, kanjiCount: 297 },
  ...FALLBACK_CALLIGRAPHY_REGULAR_CATEGORIES.slice(5),
  { id: "joyo-unclassified", grouping: "joyo", label: "Unclassified", order: 10, isResidual: true, kanjiCount: 297 }
];

function isPromise<T>(value: Promise<T> | T): value is Promise<T> {
  return typeof (value as Promise<T>).then === "function";
}

function normalizeCategories(categories: ReadonlyArray<CalligraphyCategory>): ReadonlyArray<CalligraphyCategory> {
  const seenIds = new Set<string>();

  return categories
    .filter(category => {
      if ((category.grouping !== "jlpt" && category.grouping !== "joyo") || seenIds.has(category.id)) {
        return false;
      }

      seenIds.add(category.id);
      return category.kanjiCount > 0;
    })
    .map(category => ({ ...category }))
    .sort((left, right) => left.grouping.localeCompare(right.grouping) || left.order - right.order);
}
