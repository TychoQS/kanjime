import type { ApplicationErrorContext, ApplicationErrorReport } from "@kanjime/shared";
import { ApplicationError } from "@kanjime/shared";

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
      const anonymousClientId = resolveAnonymousClientId(context);

      return {
        id: dependencies.createReportId(),
        message: error.message,
        occurredAt: dependencies.readCurrentDate(),
        applicationVersion: context.applicationVersion,
        webEngine: context.webEngine,
        webEngineVersion: context.webEngineVersion,
        ...(anonymousClientId ? { anonymousClientId } : {}),
        lastActions,
        isReadyForObservability: true
      };
    }
  };
}

function resolveAnonymousClientId(context: ApplicationErrorContext): string | null {
  const identifier = context.anonymousClientId?.trim();

  if (!identifier) {
    return null;
  }

  if (identifier.includes("@")) {
    throw new ApplicationError("The anonymous client identifier cannot contain personal data.");
  }

  return identifier;
}
