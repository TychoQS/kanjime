import type { ErrorInterface } from "../../src/Features/Error/Contracts/ErrorInterface";
import type { ErrorObservabilityInterface } from "../../src/Features/Error/Contracts/ErrorObservabilityInterface";
import type { UpdateAvailableInterface } from "../../src/Features/Version/Contracts/UpdateAvailableInterface";
import type { VersionCheckInterface } from "../../src/Features/Version/Contracts/VersionCheckInterface";
import type {
  ApplicationErrorContext,
  ApplicationErrorReport,
  UpdateAvailabilityState,
  VersionCheckResult
} from "@kanjime/shared";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates a RED test stub for version checking contracts.
 */
export function createVersionCheckStub(): VersionCheckInterface {
  return {
    async checkCurrentVersion(_currentVersion: string | null): Promise<VersionCheckResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    },
    async recoverWithLastKnownConfiguration(): Promise<VersionCheckResult> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for update availability contracts.
 */
export function createUpdateAvailableStub(): UpdateAvailableInterface {
  return {
    getUpdateAvailability(_result: VersionCheckResult): UpdateAvailabilityState {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for controlled error contracts.
 */
export function createErrorStub(): ErrorInterface {
  return {
    async captureUnexpectedError(_error: Error): Promise<{ readonly message: string; readonly isControlled: boolean }> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}

/**
 * Creates a RED test stub for error observability contracts.
 */
export function createErrorObservabilityStub(): ErrorObservabilityInterface {
  return {
    async createErrorReport(_error: Error, _context: ApplicationErrorContext): Promise<ApplicationErrorReport> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
