import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreateModelLoaderController } from "../../../src/Features/Classification/Inference/CreateModelLoaderController";
import { CreateNavigationController } from "../../../src/Features/Shell/CreateNavigationController";
import { LoadingScreenView } from "../../../src/Features/Shell/LoadingScreenView";
import { createAsyncValueRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_IMAGE } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("MODEL-LOAD", () => {
  /**
   * Requirement: MODEL-LOAD
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("MODEL-LOAD", "Integration", "Postcondition", "loads the model before exposing the application flow"), async () => {
    const initializerRecorder = createAsyncValueRecorder({
      inputWidth: TEST_IMAGE.width,
      inputHeight: TEST_IMAGE.height,
      isLoaded: true
    });
    const clearRecorder = createVoidArgumentRecorder<"classification" | "search" | "history" | "about" | "kanjiEntry">();
    const publishRecorder = createVoidArgumentRecorder<{ page: "classification"; mode: "image" }>();

    const modelLoader = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });
    const navigation = CreateNavigationController({
      clearPageState: clearRecorder.handler,
      publishInitialRoute: publishRecorder.handler
    });

    renderWithIonic(
      <LoadingScreenView
        isVisible={true}
        message="Loading model"
        blocksInteraction={true}
      />
    );

    await modelLoader.loadModel();
    const route = navigation.getInitialRoute();

    expect(initializerRecorder.calls).toHaveLength(1, "Model load flow did not initialize the runtime once.");
    expect(modelLoader.isModelReady()).toBe(true, "Model load flow did not expose a ready model.");
    expect(publishRecorder.calls).toEqual([route], "Model load flow did not publish the initial route.");
    expect(screen.getByText("Loading model")).toBeInTheDocument();
  });
});
