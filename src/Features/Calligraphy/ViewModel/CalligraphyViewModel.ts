import type { CreateCalligraphyControllerDependencies } from "../CreateCalligraphyController";
import type { CalligraphyInterface } from "../Contracts/CalligraphyInterface";
import type { CalligraphyCategory, CalligraphyGrouping } from "../../../Shared/DomainTypes";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the main calligraphy view model.
 */
export function createCalligraphyViewModel(
  _dependencies: CreateCalligraphyControllerDependencies
): CalligraphyInterface {
  return {
    getActiveGrouping(): CalligraphyGrouping {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    selectGrouping(_grouping: CalligraphyGrouping): void {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    getVisibleCategories(): ReadonlyArray<CalligraphyCategory> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    openCategory(_categoryId: string): Promise<void> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
