import type { AdminErrorDetail, AdminErrorStatus } from "@kanjime/shared";

import type { AdminErrorDetailInterface } from "../Contracts/AdminErrorDetailInterface";
import type { CreateAdminErrorDetailControllerDependencies } from "../CreateAdminErrorDetailController";

/**
 * Creates the admin error detail view model.
 */
export function createAdminErrorDetailViewModel(
  dependencies: CreateAdminErrorDetailControllerDependencies
): AdminErrorDetailInterface {
  void dependencies;

  return {
    async getErrorDetail(errorId: string): Promise<AdminErrorDetail> {
      const detail = await dependencies.getErrorDetail(errorId);

      if (detail.id !== errorId) {
        throw new Error("The selected error could not be found.");
      }

      return {
        id: detail.id,
        message: detail.message,
        occurredAt: detail.occurredAt,
        applicationVersion: detail.applicationVersion,
        status: detail.status,
        context: {
          applicationVersion: detail.context.applicationVersion,
          webEngine: detail.context.webEngine,
          webEngineVersion: detail.context.webEngineVersion,
          anonymousClientId: detail.context.anonymousClientId,
          lastActions: detail.context.lastActions
        }
      };
    },
    async updateErrorStatus(errorId: string, status: AdminErrorStatus): Promise<AdminErrorDetail> {
      void errorId;
      void status;

      if (!dependencies.updateErrorStatus) {
        throw new Error("Not implemented yet");
      }

      return dependencies.updateErrorStatus(errorId, status);
    }
  };
}
