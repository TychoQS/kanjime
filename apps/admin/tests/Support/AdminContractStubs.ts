import type { AdminDashboardInterface } from "../../src/Features/Dashboard/Contracts/AdminDashboardInterface";
import type { AdminErrorDetailInterface } from "../../src/Features/Errors/Contracts/AdminErrorDetailInterface";
import type { AdminErrorsInterface } from "../../src/Features/Errors/Contracts/AdminErrorsInterface";
import type { AdminVersionFormInterface } from "../../src/Features/Versions/Contracts/AdminVersionFormInterface";
import type { AdminVersionsInterface } from "../../src/Features/Versions/Contracts/AdminVersionsInterface";
import type {
  AdminErrorDetail,
  AdminErrorSummary,
  AdminTechnicalSummary,
  AdminVersionFormState,
  AdminVersionSummary,
  VersionConfiguration
} from "@kanjime/shared";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates a RED test stub for the admin dashboard contract.
 */
export function createAdminDashboardStub(): AdminDashboardInterface {
  return {
    async loadTechnicalSummary(): Promise<AdminTechnicalSummary> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for admin version reads.
 */
export function createAdminVersionsStub(): AdminVersionsInterface {
  return {
    async getVersionSummary(_configuration: VersionConfiguration): Promise<AdminVersionSummary> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for admin version form editing.
 */
export function createAdminVersionFormStub(): AdminVersionFormInterface {
  return {
    validateVersionConfiguration(_configuration: VersionConfiguration): AdminVersionFormState {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    async saveVersionConfiguration(_configuration: VersionConfiguration): Promise<VersionConfiguration> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for admin error list reads.
 */
export function createAdminErrorsStub(): AdminErrorsInterface {
  return {
    async listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for admin error detail reads.
 */
export function createAdminErrorDetailStub(): AdminErrorDetailInterface {
  return {
    async getErrorDetail(_errorId: string): Promise<AdminErrorDetail> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
