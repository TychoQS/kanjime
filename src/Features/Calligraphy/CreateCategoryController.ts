import type { CategoryInterface } from "./Contracts/CategoryInterface";
import { createCategoryViewModel } from "./ViewModel/CategoryViewModel";
import {CategoryKanjiEntry} from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the category controller.
 */
export interface CreateCategoryControllerDependencies {
  readonly getKanjiByCategory: (
      categoryId: string
  ) => Promise<ReadonlyArray<CategoryKanjiEntry>>;
  readonly startCalligraphyPractice: (character: string) => Promise<void>;
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
