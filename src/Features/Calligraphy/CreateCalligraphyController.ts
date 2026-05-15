import type { CalligraphyInterface } from "./Contracts/CalligraphyInterface";
import { createCalligraphyViewModel } from "./ViewModel/CalligraphyViewModel";
import {CalligraphyCategory} from "../../Shared/DomainTypes";

/**
 * External collaborators consumed by the calligraphy controller.
 */
export interface CreateCalligraphyControllerDependencies {
  readonly getCategories: () => Promise<ReadonlyArray<CalligraphyCategory>>;

  readonly getCategoryCharacters: (
      categoryId: string
  ) => Promise<ReadonlyArray<string>>;
}

/**
 * Creates the calligraphy controller.
 */
export function CreateCalligraphyController(
  dependencies: CreateCalligraphyControllerDependencies
): CalligraphyInterface {
  return createCalligraphyViewModel(dependencies);
}
