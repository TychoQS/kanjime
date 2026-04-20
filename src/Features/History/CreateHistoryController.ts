import type { HistoryInterface } from "./Contracts/HistoryInterface";
import type { HistoryCategory, HistoryGroup } from "../../Shared/DomainTypes";

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
 * Creates the history controller stub used by the RED test suite.
 */
export function CreateHistoryController(
  _dependencies: CreateHistoryControllerDependencies
): HistoryInterface {
  return {
    async getEntriesByCategory(): Promise<ReadonlyArray<HistoryGroup>> {
      return [];
    },
    async saveEntry(): Promise<void> {},
    async openKanjiEntry(_character: string): Promise<void> {}
  };
}
