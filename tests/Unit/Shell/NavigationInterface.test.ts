import { describe, expect, it } from "vitest";

import { CreateNavigationController } from "../../../src/Features/Shell/CreateNavigationController";
import { createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("NavigationInterface", () => {
  /**
   * Requirement: R27
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R27", "Unit", "Postcondition", "clears the current page state during navigation"), () => {
    const clearRecorder = createVoidArgumentRecorder<"classification" | "search" | "history" | "about" | "kanjiEntry">();
    const publishRecorder = createVoidArgumentRecorder<{ page: "classification"; mode: "image" }>();
    const controller = CreateNavigationController({
      clearPageState: clearRecorder.handler,
      publishInitialRoute: publishRecorder.handler
    });

    controller.navigateTo("history");

    expect(clearRecorder.calls).toEqual(["history"], "NavigationInterface did not clear the current page state.");
  });

  /**
   * Requirement: R28
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R28", "Unit", "Postcondition", "publishes the OCR image route as the initial state"), () => {
    const clearRecorder = createVoidArgumentRecorder<"classification" | "search" | "history" | "about" | "kanjiEntry">();
    const publishRecorder = createVoidArgumentRecorder<{ page: "classification"; mode: "image" }>();
    const controller = CreateNavigationController({
      clearPageState: clearRecorder.handler,
      publishInitialRoute: publishRecorder.handler
    });

    const route = controller.getInitialRoute();

    expect(publishRecorder.calls).toEqual([route], "NavigationInterface did not publish the initial OCR route.");
    expect(route).toEqual({ page: "classification", mode: "image" }, "NavigationInterface returned an unexpected initial route.");
  });
});
