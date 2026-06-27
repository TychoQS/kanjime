import type { CategoryInterface } from "./Contracts/CategoryInterface";
import { createCategoryViewModel } from "./ViewModel/CategoryViewModel";
import type { CategoryKanjiEntry, CalligraphyGrouping } from "@kanjime/shared";

/**
 * External collaborators consumed by the category controller.
 */
export interface CreateCategoryControllerDependencies {
  readonly getKanjiByCategory: (
      categoryId: string
  ) => Promise<ReadonlyArray<CategoryKanjiEntry>>;
  readonly searchKanjiByCategory?: (
      categoryId: string,
      term: string
  ) => Promise<ReadonlyArray<CategoryKanjiEntry>>;
  readonly startCalligraphyPractice: (character: string, grouping?: CalligraphyGrouping) => Promise<void>;
  readonly returnToCalligraphy: () => Promise<void>;
}

/**
 * Creates the category controller.
 */
export function CreateCategoryController(
  dependencies: CreateCategoryControllerDependencies
): CategoryInterface {
  return createCategoryViewModel(dependencies);
}
