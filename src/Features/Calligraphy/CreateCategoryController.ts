import type { CategoryInterface } from "./Contracts/CategoryInterface";
import { createCategoryViewModel } from "./ViewModel/CategoryViewModel";

/**
 * External collaborators consumed by the category controller.
 */
export interface CreateCategoryControllerDependencies {}

/**
 * Creates the category controller.
 */
export function CreateCategoryController(
  dependencies: CreateCategoryControllerDependencies
): CategoryInterface {
  return createCategoryViewModel(dependencies);
}
