import { describe, expect, it } from "vitest";

import { CreateErrorObservabilityController } from "../../../src/Features/Error/CreateErrorObservabilityController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type { ApplicationErrorContext, ApplicationUserAction } from "@kanjime/shared";

describe("ErrorObservabilityInterface", () => {
  const APPLICATION_VERSION = "1.0.0";
  const WEB_ENGINE = "Chromium";
  const WEB_ENGINE_VERSION = "124.0.0";
  const ERROR_IDENTIFIER = "error-report-1";
  const ERROR_DATE = "2026-05-27T00:00:00.000Z";
  const UNEXPECTED_ERROR = new Error("Unexpected rendering failure");
  const LAST_ACTIONS: ReadonlyArray<ApplicationUserAction> = [
    { type: "navigation:opened", page: "classification", occurredAt: ERROR_DATE },
    { type: "classification:mode-selected", mode: "drawing", occurredAt: ERROR_DATE }
  ];
  const ERROR_CONTEXT: ApplicationErrorContext = {
    applicationVersion: APPLICATION_VERSION,
    webEngine: WEB_ENGINE,
    webEngineVersion: WEB_ENGINE_VERSION,
    lastActions: LAST_ACTIONS
  };

  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R61", "Unit", "Precondition", "creates report from captured error context"), async () => {
    const createReportId = createValueRecorder(ERROR_IDENTIFIER);
    const readCurrentDate = createValueRecorder(ERROR_DATE);
    const controller = CreateErrorObservabilityController({
      createReportId: createReportId.handler,
      readCurrentDate: readCurrentDate.handler
    });

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.message, "The error report does not include the captured error message.").toBe(UNEXPECTED_ERROR.message);
  });

  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R61", "Unit", "Invariant", "includes required traceability fields"), async () => {
    const createReportId = createValueRecorder(ERROR_IDENTIFIER);
    const readCurrentDate = createValueRecorder(ERROR_DATE);
    const controller = CreateErrorObservabilityController({
      createReportId: createReportId.handler,
      readCurrentDate: readCurrentDate.handler
    });

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.applicationVersion, "The error report does not include the application version.").toBe(APPLICATION_VERSION);
    expect(report.webEngine, "The error report does not include the web engine.").toBe(WEB_ENGINE);
    expect(report.webEngineVersion, "The error report does not include the web engine version.").toBe(WEB_ENGINE_VERSION);
    expect(report.lastActions.length, "The error report does not include any user action context.").toBeGreaterThan(0);
    expect(report.lastActions.length, "The error report includes more than the ten allowed user actions.").toBeLessThanOrEqual(10);
    expect(report.lastActions, "The error report does not preserve the expected user action context.").toEqual(LAST_ACTIONS);
  });

  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R61", "Unit", "Postcondition", "prepares report for observability registration"), async () => {
    const createReportId = createValueRecorder(ERROR_IDENTIFIER);
    const readCurrentDate = createValueRecorder(ERROR_DATE);
    const controller = CreateErrorObservabilityController({
      createReportId: createReportId.handler,
      readCurrentDate: readCurrentDate.handler
    });

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.id, "The error report does not include a generated identifier.").toBe(ERROR_IDENTIFIER);
    expect(report.occurredAt, "The error report does not include the report creation date.").toBe(ERROR_DATE);
    expect(report.isReadyForObservability, "The error report is not ready for observability registration.").toBe(true);
  });
});
