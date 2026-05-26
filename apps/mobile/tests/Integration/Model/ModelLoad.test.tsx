import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CreateModelLoaderController } from "../../../src/Features/Classification/Inference/CreateModelLoaderController";
import { CreateNavigationController } from "../../../src/Features/Shell/CreateNavigationController";
import { LoadingScreenView } from "../../../src/Features/Shell/LoadingScreenView";
import { createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_IMAGE } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

function createControlledInitializer() {
  let resolveInitializer: ((value: { inputWidth: number; inputHeight: number; isLoaded: boolean }) => void) | null = null;
  const calls: number[] = [];

  return {
    calls,
    handler: () => {
      calls.push(calls.length + 1);
      return new Promise<{ inputWidth: number; inputHeight: number; isLoaded: boolean }>((resolve) => {
        resolveInitializer = resolve;
      });
    },
    resolve(): void {
      if (resolveInitializer) {
        resolveInitializer({
          inputWidth: TEST_IMAGE.width,
          inputHeight: TEST_IMAGE.height,
          isLoaded: true
        });
      }
    }
  };
}

describe("MODEL-LOAD", () => {
  /**
   * Requirement: MODEL-LOAD
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("MODEL-LOAD", "Integration", "All", "loads the model before exposing the application flow"), async () => {
    const initializerRecorder = createControlledInitializer();
    const clearRecorder = createVoidArgumentRecorder<"classification" | "search" | "history" | "about" | "kanjiEntry">();
    const publishRecorder = createVoidArgumentRecorder<{ page: "classification"; mode: "image" }>();

    const modelLoader = CreateModelLoaderController({
      initializeModelRuntime: initializerRecorder.handler
    });
    const navigation = CreateNavigationController({
      clearPageState: clearRecorder.handler,
      publishInitialRoute: publishRecorder.handler
    });

    // Precondition: model is not yet loaded
    expect(modelLoader.isModelReady(), "MODEL-LOAD precondition failed: the model loader should start in a not-ready state before loadModel() is called.").toBe(false);

    const { rerender } = renderWithIonic(
      <LoadingScreenView
        isVisible={!modelLoader.isModelReady()}
        message="Loading model"
        blocksInteraction={true}
      />
    );
    const pendingLoad = modelLoader.loadModel();

    // Invariant: loading screen is shown while model is not ready
    expect(modelLoader.isModelReady(), "MODEL-LOAD invariant failed: the model became ready before the pending initialization promise resolved.").toBe(false);
    expect(screen.getByTestId("loading-screen-view")).toBeInTheDocument();
    expect(screen.getByTestId("loading-screen-view")).toHaveAttribute("aria-busy", "true");
    expect(publishRecorder.calls, "MODEL-LOAD invariant failed: the app published its initial route before the model finished loading.").toHaveLength(0);

    initializerRecorder.resolve();
    await pendingLoad;
    rerender(
      <LoadingScreenView
        isVisible={!modelLoader.isModelReady()}
        message="Loading model"
        blocksInteraction={true}
      />
    );

    // Postcondition: model is ready and initialized exactly once
    expect(initializerRecorder.calls, "MODEL-LOAD postcondition failed: the model runtime was not initialized exactly once during startup.").toHaveLength(1);
    expect(modelLoader.isModelReady(), "MODEL-LOAD postcondition failed: the model loader did not report ready after initialization completed.").toBe(true);

    // Postcondition: after model loads the app navigates to the initial route
    navigation.navigateTo("classification");
    expect(publishRecorder.calls, "MODEL-LOAD postcondition failed: the initial application route was not published after the model became ready.").toHaveLength(1);
  });
});
