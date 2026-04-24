import type { HistoryInterface } from "./Contracts/HistoryInterface";
import type { HistoryCategory, HistoryGroup } from "../../Shared/DomainTypes";
import { createHistoryViewModel } from "./ViewModel/HistoryViewModel";

/**
 * External collaborators consumed by the history controller.
 */
export interface CreateHistoryControllerDependencies {
  readonly loadGroups: () => Promise<ReadonlyArray<HistoryGroup>>;
  readonly persistEntry: (
    entry: {
      character: string;
      category: HistoryCategory;
      createdAt: string;
    }
  ) => Promise<void>;
  readonly navigateToKanjiEntry: (character: string) => Promise<void>;
}

/**
 * Creates the history controller.
 */
export function CreateHistoryController(
  dependencies: CreateHistoryControllerDependencies
): HistoryInterface {
  return createHistoryViewModel(dependencies);
}
