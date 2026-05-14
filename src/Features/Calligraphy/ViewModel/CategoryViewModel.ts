import type { CreateCategoryControllerDependencies } from "../CreateCategoryController";
import type { CategoryInterface } from "../Contracts/CategoryInterface";
import type { CalligraphyKanjiSummary } from "../../../Shared/DomainTypes";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the selected category view model.
 */
export function createCategoryViewModel(
  _dependencies: CreateCategoryControllerDependencies
): CategoryInterface {
  return {
    getKanjiByCategory(_categoryId: string): Promise<ReadonlyArray<CalligraphyKanjiSummary>> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    startPractice(_character: string): Promise<void> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    returnToCalligraphyHome(): Promise<void> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
