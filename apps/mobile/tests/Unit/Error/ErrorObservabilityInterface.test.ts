import { describe, expect, it } from "vitest";

import { buildRequirementTitle } from "../../Support/RequirementTest";
import { createErrorObservabilityStub } from "../../Support/VersionAndErrorContractStubs";
import type { ApplicationErrorContext } from "@kanjime/shared";

const APPLICATION_VERSION = "1.0.0";
const WEB_ENGINE = "Chromium";
const WEB_ENGINE_VERSION = "124.0.0";
const ERROR_IDENTIFIER = "error-report-1";
const ERROR_DATE = "2026-05-27T00:00:00.000Z";
const ACTION_LABEL = "Opened recognition screen";
const SENSITIVE_ACTION_LABEL = "Typed password value";
const UNEXPECTED_ERROR = new Error("Unexpected rendering failure");

const ERROR_CONTEXT: ApplicationErrorContext = {
  applicationVersion: APPLICATION_VERSION,
  webEngine: WEB_ENGINE,
  webEngineVersion: WEB_ENGINE_VERSION,
  lastActions: [
    {
      label: ACTION_LABEL,
      occurredAt: ERROR_DATE
    },
    {
      label: SENSITIVE_ACTION_LABEL,
      occurredAt: ERROR_DATE
    }
  ]
};

describe("ErrorObservabilityInterface", () => {
  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R61", "Unit", "Precondition", "creates report from captured error context"), async () => {
    const controller = createErrorObservabilityStub();

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.message).toBe(UNEXPECTED_ERROR.message);
  });

  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R61", "Unit", "Invariant", "includes required traceability fields"), async () => {
    const controller = createErrorObservabilityStub();

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.applicationVersion).toBe(APPLICATION_VERSION);
    expect(report.webEngine).toBe(WEB_ENGINE);
    expect(report.webEngineVersion).toBe(WEB_ENGINE_VERSION);
    expect(report.lastActions).toHaveLength(1);
  });

  /**
   * Requirement: R61
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R61", "Unit", "Postcondition", "prepares report for observability registration"), async () => {
    const controller = createErrorObservabilityStub();

    const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

    expect(report.id).toBe(ERROR_IDENTIFIER);
    expect(report.isReadyForObservability).toBe(true);
  });
});
