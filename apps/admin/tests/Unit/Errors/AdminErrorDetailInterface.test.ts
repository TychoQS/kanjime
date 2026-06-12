import { buildRequirementTitle } from "../../Support/RequirementTest";
import { CreateAdminErrorDetailController } from "../../../src/Features/Errors/CreateAdminErrorDetailController";
import { createAsyncArgumentRecorder } from "../../Support/DependencyFactories";
import { describe, expect, it } from "vitest";
import type { AdminErrorDetail, ApplicationErrorContext, ApplicationUserAction } from "@kanjime/shared";

describe("AdminErrorDetailInterface", () => {
  const ERROR_IDENTIFIER = "error-report-1";
  const ERROR_MESSAGE = "An unexpected error has occurred.";
  const ERROR_DATE = "2026-05-27T00:00:00.000Z";
  const APPLICATION_VERSION = "1.0.0";
  const LAST_ACTIONS: ReadonlyArray<ApplicationUserAction> = [
    { type: "navigation:opened", page: "classification", occurredAt: ERROR_DATE },
    { type: "classification:mode-selected", mode: "drawing", occurredAt: ERROR_DATE },
    { type: "classification:stroke-completed", mode: "drawing", occurredAt: ERROR_DATE },
    { type: "classification:inference-requested", mode: "drawing", occurredAt: ERROR_DATE },
    { type: "navigation:opened", page: "search", occurredAt: ERROR_DATE },
    { type: "search:submitted", queryLength: 3, occurredAt: ERROR_DATE },
    { type: "kanji:detail-opened", occurredAt: ERROR_DATE },
    { type: "navigation:opened", page: "calligraphy", occurredAt: ERROR_DATE },
    { type: "calligraphy:practice-started", grouping: "jlpt", occurredAt: ERROR_DATE },
    { type: "calligraphy:evaluation-requested", grouping: "jlpt", occurredAt: ERROR_DATE }
  ];
  const ERROR_CONTEXT: ApplicationErrorContext = {
    applicationVersion: APPLICATION_VERSION,
    webEngine: "Chromium",
    webEngineVersion: "124",
    lastActions: LAST_ACTIONS
  };
  const ERROR_DETAIL: AdminErrorDetail = {
    id: ERROR_IDENTIFIER,
    message: ERROR_MESSAGE,
    occurredAt: ERROR_DATE,
    applicationVersion: APPLICATION_VERSION,
    status: "OPEN",
    context: ERROR_CONTEXT
  };

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R66", "Unit", "Precondition", "selects an existing reported error"), async () => {
    const getErrorDetail = createAsyncArgumentRecorder(ERROR_DETAIL);
    const controller = CreateAdminErrorDetailController({
      getErrorDetail: getErrorDetail.handler
    });

    await controller.getErrorDetail(ERROR_IDENTIFIER);
    expect(getErrorDetail.calls, "The selected reported error id was not requested.").toEqual([ERROR_IDENTIFIER]);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R66", "Unit", "Invariant", "matches selected error"), async () => {
    const getErrorDetail = createAsyncArgumentRecorder(ERROR_DETAIL);
    const controller = CreateAdminErrorDetailController({
      getErrorDetail: getErrorDetail.handler
    });

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.id, "The returned error detail does not match the selected reported error.").toBe(ERROR_IDENTIFIER);
  });

  /**
   * Requirement: R66
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R66", "Unit", "Postcondition", "shows selected error detail with basic context"), async () => {
    const getErrorDetail = createAsyncArgumentRecorder(ERROR_DETAIL);
    const controller = CreateAdminErrorDetailController({
      getErrorDetail: getErrorDetail.handler
    });

    const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);

    expect(detail.message, "The error detail does not show the selected error message.").toBe(ERROR_MESSAGE);
    expect(detail.occurredAt, "The error detail does not show the selected error date.").toBe(ERROR_DATE);
    expect(detail.applicationVersion, "The error detail does not show the selected application version.").toBe(APPLICATION_VERSION);
    expect(detail.context.applicationVersion, "The error detail does not show the application version in its execution context.").toBe(APPLICATION_VERSION);
    expect(detail.context.webEngine, "The error detail does not show the web engine used during the error.").toBe("Chromium");
    expect(detail.context.webEngineVersion, "The error detail does not show the web engine version used during the error.").toBe("124");
    expect(detail.context.lastActions.length, "The error detail does not include any user action in the basic execution context.").toBeGreaterThan(0);
    expect(detail.context.lastActions.length, "The error detail exposes more than the ten allowed user actions.").toBeLessThanOrEqual(10);
    expect(detail.context.lastActions, "The error detail does not preserve the expected user actions included in the execution context.").toEqual(LAST_ACTIONS);
  });
});
