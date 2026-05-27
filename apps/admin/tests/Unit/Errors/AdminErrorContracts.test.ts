import type { AdminErrorDetailProps } from "../../../src/Features/Errors/Contracts/AdminErrorDetailProps";
import type { AdminErrorsProps } from "../../../src/Features/Errors/Contracts/AdminErrorsProps";
import { expect, it } from "vitest";
import {
  createAdminErrorDetailStub,
  createAdminErrorsStub
} from "../../Support/AdminContractStubs";

const ERROR_IDENTIFIER = "error-report-1";
const ERROR_MESSAGE = "An unexpected error has occurred.";
const ERROR_DATE = "2026-05-27T00:00:00.000Z";
const APPLICATION_VERSION = "1.0.0";
const CONTEXT_SUMMARY = "Recognition screen";
const SENSITIVE_TEXT = "password";

/**
 * Requirement IDs: R65, R28.
 * Pre/Inv/Post: Reported errors are listed with useful basic data and no sensitive information.
 */
it("lists reported errors without exposing sensitive user information", async () => {
  const controller = createAdminErrorsStub();

  const errors = await controller.listReportedErrors();
  const props: AdminErrorsProps = {
    errors,
    isLoading: false,
    errorMessage: null,
    onErrorSelected: () => undefined
  };

  expect(props.errors[0].id).toBe(ERROR_IDENTIFIER);
  expect(props.errors[0].message).toBe(ERROR_MESSAGE);
  expect(props.errors[0].occurredAt).toBe(ERROR_DATE);
  expect(props.errors[0].applicationVersion).toBe(APPLICATION_VERSION);
  expect(props.errors[0].contextSummary).toBe(CONTEXT_SUMMARY);
  expect(JSON.stringify(props.errors)).not.toContain(SENSITIVE_TEXT);
});

/**
 * Requirement IDs: R66.
 * Pre/Inv/Post: The selected error detail matches the selected report and omits sensitive information.
 */
it("shows the selected error detail with basic context and no sensitive information", async () => {
  const controller = createAdminErrorDetailStub();

  const detail = await controller.getErrorDetail(ERROR_IDENTIFIER);
  const props: AdminErrorDetailProps = {
    detail,
    isLoading: false,
    errorMessage: null,
    onBackRequested: () => undefined
  };

  expect(props.detail?.id).toBe(ERROR_IDENTIFIER);
  expect(props.detail?.message).toBe(ERROR_MESSAGE);
  expect(props.detail?.occurredAt).toBe(ERROR_DATE);
  expect(props.detail?.applicationVersion).toBe(APPLICATION_VERSION);
  expect(JSON.stringify(props.detail)).not.toContain(SENSITIVE_TEXT);
});
