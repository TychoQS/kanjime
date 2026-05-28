import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";

import type { ErrorObservabilityInterface } from "../Contracts/ErrorObservabilityInterface";
import type { CreateErrorObservabilityControllerDependencies } from "../CreateErrorObservabilityController";

const MAX_REPORTED_ACTIONS = 10;

/**
 * Creates the error observability view model.
 */
export function createErrorObservabilityViewModel(
  dependencies: CreateErrorObservabilityControllerDependencies
): ErrorObservabilityInterface {
  return {
    async createErrorReport(error: Error, context: ApplicationErrorContext): Promise<ApplicationErrorReport> {
      const lastActions = context.lastActions.slice(-MAX_REPORTED_ACTIONS);

      return {
        id: dependencies.createReportId(),
        message: error.message,
        occurredAt: dependencies.readCurrentDate(),
        applicationVersion: context.applicationVersion,
        webEngine: context.webEngine,
        webEngineVersion: context.webEngineVersion,
        lastActions,
        isReadyForObservability: true
      };
    }
  };
}
