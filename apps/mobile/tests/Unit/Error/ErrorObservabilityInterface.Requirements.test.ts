import { describe, expect, it } from "vitest";

import { CreateErrorObservabilityController } from "../../../src/Features/Error/CreateErrorObservabilityController";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("ErrorObservabilityInterface requirements", () => {
  const errorObservabilityController = CreateErrorObservabilityController({
    createReportId: () => "report-001",
    readCurrentDate: () => "2026-06-12T10:00:00.000Z"
  });

  const controlledError = new Error("An unexpected error has occurred.");
  const executionContext = {
    applicationVersion: "1.2.3",
    webEngine: "web",
    webEngineVersion: "126.0",
    anonymousClientId: "anon-installation-001",
    lastActions: [
      {
        type: "error:captured" as const,
        occurredAt: "2026-06-12T09:59:00.000Z"
      }
    ]
  };

  /**
   * Requirement R71 - Precondition (valid):
   * a captured error with an anonymous installation identifier should generate a report.
   */
  it(buildRequirementTitle("R71", "Unit", "Precondition", "captured errors with an anonymous installation identifier generate a report"), async () => {
    await expect(
      errorObservabilityController.createErrorReport(controlledError, executionContext),
      "R71 valid precondition should accept a captured error and an anonymous installation identifier."
    ).resolves.toEqual(expect.objectContaining({
      anonymousClientId: executionContext.anonymousClientId
    }));
  });

  /**
   * Requirement R71 - Precondition (invalid):
   * personal identifiers should be rejected when building an anonymous observability report.
   */
  it(buildRequirementTitle("R71", "Unit", "Precondition", "personal identifiers are rejected from anonymous error reports"), async () => {
    await expect(
      errorObservabilityController.createErrorReport(controlledError, {
        ...executionContext,
        anonymousClientId: "user@example.test"
      }),
      "R71 invalid precondition should reject personal identifiers inside the anonymous client identifier slot."
    ).rejects.toThrow("anonymous");
  });

  /**
   * Requirement R71 - Invariant:
   * the anonymous identifier included in the report should not contain personal user data.
   */
  it(buildRequirementTitle("R71", "Unit", "Invariant", "the anonymous identifier excludes personal data"), async () => {
    const report = await errorObservabilityController.createErrorReport(controlledError, executionContext);

    expect(
      report.anonymousClientId?.includes("@"),
      "R71 invariant should keep personal data such as e-mail fragments out of the anonymous identifier."
    ).toBe(false);
  });

  /**
   * Requirement R71 - Postcondition:
   * the generated report should include the anonymous client or installation identifier.
   */
  it(buildRequirementTitle("R71", "Unit", "Postcondition", "the generated report includes the anonymous client identifier"), async () => {
    const report = await errorObservabilityController.createErrorReport(controlledError, executionContext);

    expect(
      report.anonymousClientId,
      "R71 postcondition should include the anonymous client or installation identifier in the generated report."
    ).toBe("anon-installation-001");
  });
});
