import packageMetadata from "../package.json";

import type {
  AdminErrorDetail,
  AdminErrorSummary,
  AdminTechnicalSummary,
  ApplicationErrorReport,
  ObservabilityRepository,
  VersionConfiguration
} from "@kanjime/shared";

import { CreateAdminDashboardController } from "./Features/Dashboard/CreateAdminDashboardController";
import type { AdminDashboardInterface } from "./Features/Dashboard/Contracts/AdminDashboardInterface";
import { CreateAdminErrorDetailController } from "./Features/Errors/CreateAdminErrorDetailController";
import type { AdminErrorDetailInterface } from "./Features/Errors/Contracts/AdminErrorDetailInterface";
import { CreateAdminErrorsController } from "./Features/Errors/CreateAdminErrorsController";
import type { AdminErrorsInterface } from "./Features/Errors/Contracts/AdminErrorsInterface";
import { CreateAdminVersionFormController } from "./Features/Versions/CreateAdminVersionFormController";
import type { AdminVersionFormInterface } from "./Features/Versions/Contracts/AdminVersionFormInterface";
import { CreateAdminVersionsController } from "./Features/Versions/CreateAdminVersionsController";
import type { AdminVersionsInterface } from "./Features/Versions/Contracts/AdminVersionsInterface";
import { AdminObservabilityRepository } from "./Shared/AdminObservabilityRepository";
import {
  createAdminAuthenticationClient,
  type AdminAuthenticationClient
} from "./Shared/FirebaseClient";

/**
 * Administration dependency graph.
 */
export interface AdminCompositionRoot {
  readonly authentication: AdminAuthenticationClient;
  readonly repository: ObservabilityRepository;
  readonly dashboardController: AdminDashboardInterface;
  readonly versionsController: AdminVersionsInterface;
  readonly versionFormController: AdminVersionFormInterface;
  readonly errorsController: AdminErrorsInterface;
  readonly errorDetailController: AdminErrorDetailInterface;
  readonly createInitialVersionConfiguration: () => VersionConfiguration;
  readonly loadVersionConfiguration: () => Promise<VersionConfiguration | null>;
}

/**
 * Builds the administration dependency graph.
 */
export function createAdminCompositionRoot(): AdminCompositionRoot {
  const repository = new AdminObservabilityRepository();
  const authentication = createAdminAuthenticationClient();

  const loadVersionConfiguration = async (): Promise<VersionConfiguration | null> =>
    repository.getVersionConfiguration();

  const versionsController = CreateAdminVersionsController({
    readCurrentDate: () => new Date().toISOString()
  });

  const versionFormController = CreateAdminVersionFormController({
    saveVersionConfiguration: async configuration => {
      await repository.saveVersionConfiguration(configuration);
      return configuration;
    }
  });

  const errorsController = CreateAdminErrorsController({
    listReportedErrors: async () => {
      const reports = await repository.listErrorReports();
      return reports.map(report => createErrorSummary(report));
    }
  });

  const errorDetailController = CreateAdminErrorDetailController({
    getErrorDetail: async errorId => {
      const report = await repository.getErrorReport(errorId);

      if (report === null) {
        throw new Error("The selected error could not be found.");
      }

      return createErrorDetail(report);
    }
  });

  const dashboardController = CreateAdminDashboardController({
    loadTechnicalSummary: async () => {
      const [configuration, reports] = await Promise.all([
        repository.getVersionConfiguration(),
        repository.listErrorReports()
      ]);

      if (configuration === null) {
        throw new Error("The version configuration is not available.");
      }

      return createTechnicalSummary(configuration, reports);
    }
  });

  return {
    authentication,
    repository,
    dashboardController,
    versionsController,
    versionFormController,
    errorsController,
    errorDetailController,
    createInitialVersionConfiguration: () => ({
      currentVersion: packageMetadata.version,
      latestVersion: packageMetadata.version,
      minimumSupportedVersion: packageMetadata.version,
      updatedAt: new Date().toISOString()
    }),
    loadVersionConfiguration
  };
}

function createErrorSummary(report: ApplicationErrorReport): AdminErrorSummary {
  return {
    id: report.id,
    message: report.message,
    occurredAt: report.occurredAt,
    applicationVersion: report.applicationVersion,
    contextSummary: `${report.webEngine} ${report.webEngineVersion}`.trim()
  };
}

function createErrorDetail(report: ApplicationErrorReport): AdminErrorDetail {
  return {
    id: report.id,
    message: report.message,
    occurredAt: report.occurredAt,
    applicationVersion: report.applicationVersion,
    context: {
      applicationVersion: report.applicationVersion,
      webEngine: report.webEngine,
      webEngineVersion: report.webEngineVersion,
      lastActions: report.lastActions
    }
  };
}

function createTechnicalSummary(
  configuration: VersionConfiguration,
  reports: ReadonlyArray<ApplicationErrorReport>
): AdminTechnicalSummary {
  const latestReport = reports.reduce<ApplicationErrorReport | null>((latest, report) => {
    if (latest === null || report.occurredAt > latest.occurredAt) {
      return report;
    }

    return latest;
  }, null);

  return {
    versionConfiguration: configuration,
    reportedErrorCount: reports.length,
    latestReportedErrorAt: latestReport?.occurredAt ?? null
  };
}
