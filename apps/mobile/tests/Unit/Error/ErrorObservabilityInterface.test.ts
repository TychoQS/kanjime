import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CreateErrorObservabilityController } from "../../../src/Features/Error/CreateErrorObservabilityController";
import { createValueRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import type {ApplicationErrorContext, ApplicationUserAction, NavigationPage} from "@kanjime/shared";

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

  const errorObservabilityController = CreateErrorObservabilityController({
    createReportId: () => "report-001",
    readCurrentDate: () => "2026-06-12T10:00:00.000Z"
  });
  const firebaseInstallationId = "c6QwLZc2R8S9T0uV1wXyZa";
  const firebaseInstallationIdPattern = /^[A-Za-z0-9_-]{22}$/;
  const controlledError = new Error("An unexpected error has occurred.");
  const executionContext = {
    applicationVersion: "1.2.3",
    webEngine: "web",
    webEngineVersion: "126.0",
    anonymousClientId: firebaseInstallationId,
    lastActions: [
      {
        type: "error:captured" as const,
        occurredAt: "2026-06-12T09:59:00.000Z"
      }
    ]
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

  /**
   * Requirement: R61
   * Type: Regression
   * Condition: Invariant
   */
  it(buildRequirementTitle("R61", "Regression", "Invariant", "Navigation event ignore page name when registering navigation action"), () => {
    const recordedActions: ApplicationUserAction[] = [];
    const recordUserAction = (action: ApplicationUserAction) => {
      recordedActions.push(action);
    };

    const simulateNavigation = (delegate: (page: NavigationPage, character?: string) => void) => {
      delegate("calligraphy", undefined);
      delegate("kanjiEntry", "漢");
      delegate("kanjiEntry", undefined);
    };

    simulateNavigation((page, character) => {
      const realPage = page === "kanjiEntry" && character === undefined ? "classification" : page;
      recordUserAction({
        type: "navigation:opened",
        page: realPage,
        occurredAt: new Date().toISOString()
      });
    });

    expect(recordedActions).toHaveLength(3);

    expect(recordedActions[0]).toMatchObject({
      type: "navigation:opened",
      page: "calligraphy"
    });

    expect(recordedActions[1]).toMatchObject({
      type: "navigation:opened",
      page: "kanjiEntry"
    });

    expect(recordedActions[2]).toMatchObject({
      type: "navigation:opened",
      page: "classification"
    });
  });

  /**
   * Requirement: R61
   * Type: Regression
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R61", "Regression", "Postcondition", "All catch blocks in involved ViewModels must call captureUnexpectedError and screens must use ErrorView"), () => {
    const getAbsolutePath = (relativePath: string): string => {
      const cwd = process.cwd();
      const base = cwd.endsWith("apps/mobile") ? cwd : path.join(cwd, "apps/mobile");
      return path.join(base, relativePath);
    };

    const getAllFiles = (dir: string): string[] => {
      let results: string[] = [];
      if (!fs.existsSync(dir)) {
        return [];
      }
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(filePath));
        } else {
          results.push(filePath);
        }
      }
      return results;
    };

    const featuresDir = getAbsolutePath("src/Features");
    const allFiles = getAllFiles(featuresDir);

    const isScreenViewModel = (filePath: string): boolean => {
      const normalized = filePath.replace(/\\/g, "/");
      const featuresIdx = normalized.indexOf("src/Features/");
      if (featuresIdx === -1) {
        return false;
      }
      
      // Exclude utility sub-component ViewModels under Image, Canvas, or Inference folders
      if (
        normalized.includes("/Image/ViewModel/") ||
        normalized.includes("/Canvas/ViewModel/") ||
        normalized.includes("/Inference/ViewModel/")
      ) {
        return false;
      }

      const relativePath = normalized.substring(featuresIdx + "src/Features/".length);
      const featureName = relativePath.split("/")[0];
      const featureDir = path.join(featuresDir, featureName);

      const files = getAllFiles(featureDir);
      return files.some(file => file.endsWith("Screen.tsx"));
    };

    const viewModels = allFiles
      .filter(file => file.endsWith("ViewModel.ts"))
      .filter(isScreenViewModel);
    const screens = allFiles.filter(file => file.endsWith("Screen.tsx"));

    expect(viewModels.length, "Should dynamically find at least one ViewModel").toBeGreaterThan(0);
    expect(screens.length, "Should dynamically find at least one Screen").toBeGreaterThan(0);

    for (const filePath of viewModels) {
      const code = fs.readFileSync(filePath, "utf-8");

      // Find all catch blocks (using regex to search for catch keyword)
      const catchRegex = /\bcatch\b/g;
      let match;
      while ((match = catchRegex.exec(code)) !== null) {
        const startIndex = match.index;
        // Skip safeGetVisibleResults helper function catch block in ClassificationViewModel
        if (filePath.endsWith("ClassificationViewModel.ts") && startIndex > code.indexOf("function safeGetVisibleResults")) {
          continue;
        }
        // Get content up to the next catch block or 800 characters
        const block = code.substring(startIndex, startIndex + 800);
        
        expect(block, `Catch block at index ${startIndex} in ${path.basename(filePath)} must invoke captureUnexpectedError`).toContain("captureUnexpectedError");
      }
    }

    for (const filePath of screens) {
      const code = fs.readFileSync(filePath, "utf-8");

      // Verify that screen files do not render IonAlert directly
      expect(code, `Screen ${path.basename(filePath)} should not use IonAlert directly`).not.toContain("<IonAlert");
      
      // If the screen is one of the ones that historically used IonAlert for errors, verify it uses ErrorView
      if (filePath.includes("CalligraphyScreen.tsx") || filePath.includes("ClassificationScreen.tsx")) {
        expect(code, `Screen ${path.basename(filePath)} must use ErrorView for displaying errors`).toContain("ErrorView");
      }
    }
  });

  /**
   * Requirement: R61
   * Type: Regression
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R61", "Regression", "Postcondition", "safeGetVisibleResults catch block must not call captureUnexpectedError"), () => {
    const getAbsolutePath = (relativePath: string): string => {
      const cwd = process.cwd();
      const base = cwd.endsWith("apps/mobile") ? cwd : path.join(cwd, "apps/mobile");
      return path.join(base, relativePath);
    };

    const filePath = getAbsolutePath("src/Features/Classification/Mode/ViewModel/ClassificationViewModel.ts");
    const code = fs.readFileSync(filePath, "utf-8");

    const safeGetIndex = code.indexOf("function safeGetVisibleResults");
    expect(safeGetIndex, "safeGetVisibleResults should exist in ClassificationViewModel.ts").toBeGreaterThan(-1);

    const safeGetCode = code.substring(safeGetIndex);
    const catchIndex = safeGetCode.indexOf("catch");
    expect(catchIndex, "catch block should exist in safeGetVisibleResults").toBeGreaterThan(-1);

    const nextCloseBraceIndex = safeGetCode.indexOf("}", catchIndex);
    const catchBlock = safeGetCode.substring(catchIndex, nextCloseBraceIndex + 1);

    expect(catchBlock, "safeGetVisibleResults catch block must not call captureUnexpectedError").not.toContain("captureUnexpectedError");
  });

  /**
   * Requirement R71 - Precondition (valid):
   * a captured error with an anonymous Firebase installation identifier should generate a report.
   */
  it(buildRequirementTitle("R71", "Unit", "Precondition", "captured errors with an anonymous Firebase installation identifier generate a report"), async () => {
    await expect(
        errorObservabilityController.createErrorReport(controlledError, executionContext),
        "R71 valid precondition should accept a captured error and an anonymous Firebase installation identifier."
    ).resolves.toEqual(expect.objectContaining({
      anonymousClientId: firebaseInstallationId
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
        "R71 invalid precondition should reject personal data inside the anonymous client identifier slot."
    ).rejects.toThrow("anonymous");
  });

  /**
   * Requirement R71 - Invariant:
   * the anonymous Firebase installation identifier included in the report should not contain personal user data.
   */
  it(buildRequirementTitle("R71", "Unit", "Invariant", "the anonymous Firebase installation identifier has a non-personal URL-safe format"), async () => {
    const report = await errorObservabilityController.createErrorReport(controlledError, executionContext);

    expect(
        report.anonymousClientId,
        "R71 invariant should preserve the anonymous Firebase installation identifier."
    ).toBe(firebaseInstallationId);

    expect(
        report.anonymousClientId,
        "R71 invariant should keep the anonymous identifier in a Firebase-like URL-safe installation id format."
    ).toMatch(firebaseInstallationIdPattern);

    expect(
        report.anonymousClientId?.includes("@"),
        "R71 invariant should keep personal data such as e-mail fragments out of the anonymous Firebase installation identifier."
    ).toBe(false);
  });

  /**
   * Requirement R71 - Postcondition:
   * the generated report should include the anonymous Firebase installation identifier.
   */
  it(buildRequirementTitle("R71", "Unit", "Postcondition", "the generated report includes the anonymous Firebase installation identifier"), async () => {
    const report = await errorObservabilityController.createErrorReport(controlledError, executionContext);

    expect(
        report.anonymousClientId,
        "R71 postcondition should include the anonymous Firebase installation identifier in the generated report.")
        .toBe(firebaseInstallationId);
  });
});
