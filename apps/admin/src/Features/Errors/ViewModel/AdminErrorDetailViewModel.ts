import type { AdminErrorDetail, AdminErrorStatus } from "@kanjime/shared";

import type { AdminErrorDetailInterface } from "../Contracts/AdminErrorDetailInterface";
import type { CreateAdminErrorDetailControllerDependencies } from "../CreateAdminErrorDetailController";

const STATUS_ERROR_MESSAGE = "The selected status is not allowed.";
const ADMIN_ERROR_STATUSES = new Set<AdminErrorStatus>([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "DISCARDED"
]);

/**
 * Creates the admin error detail view model.
 */
export function createAdminErrorDetailViewModel(
  dependencies: CreateAdminErrorDetailControllerDependencies
): AdminErrorDetailInterface {
  return {
    async getErrorDetail(errorId: string): Promise<AdminErrorDetail> {
      const detail = await dependencies.getErrorDetail(errorId);

      if (detail.id !== errorId) {
        throw new Error("The selected error could not be found.");
      }

      return normalizeErrorDetail(detail);
    },
    async updateErrorStatus(errorId: string, status: AdminErrorStatus): Promise<AdminErrorDetail> {
      if (!isAdminErrorStatus(status)) {
        throw new Error(STATUS_ERROR_MESSAGE);
      }

      if (dependencies.updateErrorStatus) {
        return normalizeErrorDetail(await dependencies.updateErrorStatus(errorId, status));
      }

      const detail = await dependencies.getErrorDetail(errorId);
      return normalizeErrorDetail({
        ...detail,
        status
      });
    }
  };
}

function normalizeErrorDetail(detail: AdminErrorDetail): AdminErrorDetail {
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
}

function isAdminErrorStatus(value: AdminErrorStatus): value is AdminErrorStatus {
  return ADMIN_ERROR_STATUSES.has(value);
}
