import type { ErrorProps } from "../../../src/Features/Error/Contracts/ErrorProps";
import { expect, it } from "vitest";
import {
  createErrorObservabilityStub,
  createErrorStub
} from "../../Support/VersionAndErrorContractStubs";
import type { ApplicationErrorContext } from "@kanjime/shared";

const APPLICATION_VERSION = "1.0.0";
const WEB_ENGINE = "Chromium";
const WEB_ENGINE_VERSION = "124.0.0";
const SAFE_ERROR_MESSAGE = "An unexpected error has occurred. You can continue using the application.";
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

/**
 * Requirement IDs: R60, R25.
 * Pre/Inv/Post: An unexpected runtime error is captured and rendered with a safe message.
 */
it("captures unexpected errors without exposing technical details", async () => {
  const controller = createErrorStub();

  const state = await controller.captureUnexpectedError(UNEXPECTED_ERROR);
  const props: ErrorProps = {
    isVisible: state.isControlled,
    message: state.message,
    canContinue: true,
    onDismissRequested: () => undefined
  };

  expect(props.isVisible).toBe(true);
  expect(props.message).toBe(SAFE_ERROR_MESSAGE);
  expect(props.message).not.toContain("Error:");
  expect(props.message).not.toContain("stack");
});

/**
 * Requirement IDs: R61.
 * Pre/Inv/Post: A structured report is generated with traceability fields and no sensitive data.
 */
it("creates a structured report ready for observability without sensitive data", async () => {
  const controller = createErrorObservabilityStub();

  const report = await controller.createErrorReport(UNEXPECTED_ERROR, ERROR_CONTEXT);

  expect(report.id).toBe(ERROR_IDENTIFIER);
  expect(report.message).toBe(UNEXPECTED_ERROR.message);
  expect(report.occurredAt).toBe(ERROR_DATE);
  expect(report.applicationVersion).toBe(APPLICATION_VERSION);
  expect(report.webEngine).toBe(WEB_ENGINE);
  expect(report.webEngineVersion).toBe(WEB_ENGINE_VERSION);
  expect(report.lastActions).toHaveLength(1);
  expect(report.lastActions[0].label).toBe(ACTION_LABEL);
  expect(report.isReadyForObservability).toBe(true);
});
