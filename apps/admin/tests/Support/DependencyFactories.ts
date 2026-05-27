import type { CreateAdminDashboardControllerDependencies } from "../../src/Features/Dashboard/CreateAdminDashboardController";
import type { CreateAdminErrorDetailControllerDependencies } from "../../src/Features/Errors/CreateAdminErrorDetailController";
import type { CreateAdminErrorsControllerDependencies } from "../../src/Features/Errors/CreateAdminErrorsController";
import type { CreateAdminVersionFormControllerDependencies } from "../../src/Features/Versions/CreateAdminVersionFormController";
import type { CreateAdminVersionsControllerDependencies } from "../../src/Features/Versions/CreateAdminVersionsController";
import type {
  AdminErrorDetail,
  AdminErrorSummary,
  AdminTechnicalSummary,
  VersionConfiguration
} from "@kanjime/shared";

const CURRENT_VERSION = "1.0.0";
const LATEST_VERSION = "1.1.0";
const MINIMUM_SUPPORTED_VERSION = "0.9.0";
const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
const REPORTED_ERROR_ID = "reported-error-1";
const REPORTED_ERROR_MESSAGE = "An unexpected error has occurred.";
const CONTEXT_SUMMARY = "Recognition screen";
const REPORTED_ERROR_COUNT = 3;

const VERSION_CONFIGURATION: VersionConfiguration = {
  currentVersion: CURRENT_VERSION,
  latestVersion: LATEST_VERSION,
  minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
  updatedAt: CONFIGURATION_DATE
};

const REPORTED_ERROR: AdminErrorSummary = {
  id: REPORTED_ERROR_ID,
  message: REPORTED_ERROR_MESSAGE,
  occurredAt: CONFIGURATION_DATE,
  applicationVersion: CURRENT_VERSION,
  contextSummary: CONTEXT_SUMMARY
};

const ERROR_DETAIL: AdminErrorDetail = {
  id: REPORTED_ERROR_ID,
  message: REPORTED_ERROR_MESSAGE,
  occurredAt: CONFIGURATION_DATE,
  applicationVersion: CURRENT_VERSION,
  context: {
    applicationVersion: CURRENT_VERSION,
    webEngine: "Chromium",
    webEngineVersion: "124",
    lastActions: [
      {
        label: CONTEXT_SUMMARY,
        occurredAt: CONFIGURATION_DATE
      }
    ]
  }
};

/**
 * Creates mocked dependencies for admin dashboard controller tests.
 */
export function createAdminDashboardDependencies(): CreateAdminDashboardControllerDependencies {
  const summary: AdminTechnicalSummary = {
    versionConfiguration: VERSION_CONFIGURATION,
    reportedErrorCount: REPORTED_ERROR_COUNT,
    latestReportedErrorAt: CONFIGURATION_DATE
  };

  return {
    async loadTechnicalSummary(): Promise<AdminTechnicalSummary> {
      return summary;
    }
  };
}

/**
 * Creates mocked dependencies for admin versions controller tests.
 */
export function createAdminVersionsDependencies(): CreateAdminVersionsControllerDependencies {
  return {
    readCurrentDate(): string {
      return CONFIGURATION_DATE;
    }
  };
}

/**
 * Creates mocked dependencies for admin version form controller tests.
 */
export function createAdminVersionFormDependencies(): CreateAdminVersionFormControllerDependencies {
  return {
    async saveVersionConfiguration(configuration: VersionConfiguration): Promise<VersionConfiguration> {
      return configuration;
    }
  };
}

/**
 * Creates mocked dependencies for admin errors controller tests.
 */
export function createAdminErrorsDependencies(): CreateAdminErrorsControllerDependencies {
  return {
    async listReportedErrors(): Promise<ReadonlyArray<AdminErrorSummary>> {
      return [REPORTED_ERROR];
    }
  };
}

/**
 * Creates mocked dependencies for admin error detail controller tests.
 */
export function createAdminErrorDetailDependencies(): CreateAdminErrorDetailControllerDependencies {
  return {
    async getErrorDetail(_errorId: string): Promise<AdminErrorDetail> {
      return ERROR_DETAIL;
    }
  };
}
