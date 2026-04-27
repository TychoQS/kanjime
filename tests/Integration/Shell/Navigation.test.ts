import { describe, expect, it } from "vitest";

import { CreateCanvasController } from "../../../src/Features/Classification/Canvas/CreateCanvasController";
import { CreateImageController } from "../../../src/Features/Classification/Image/CreateImageController";
import { CreateDisplayInferencesController } from "../../../src/Features/Classification/Inference/CreateDisplayInferencesController";
import { CreateUserPreferenceController } from "../../../src/Features/Preferences/CreateUserPreferenceController";
import { CreateNavigationController } from "../../../src/Features/Shell/CreateNavigationController";
import {
  createAsyncArgumentRecorder,
  createVoidArgumentRecorder,
  createVoidTupleRecorder
} from "../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE, TEST_LANGUAGE, TEST_PREDICTIONS, TEST_STROKE, TEST_THEME } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { clearRegisteredCanvasState } from "../../../src/Features/Classification/Canvas/ViewModel/CanvasViewModel";
import { clearRegisteredImageState } from "../../../src/Features/Classification/Image/ViewModel/ImageViewModel";
import { clearRegisteredInferenceDisplayState } from "../../../src/Features/Classification/Inference/ViewModel/DisplayInferencesViewModel";

describe("NAVIGATION", () => {
  /**
   * Requirement: NAVIGATION
   * Type: Integration
   * Condition: All
   */
  it(buildRequirementTitle("NAVIGATION", "Integration", "All", "clears page state while preserving user preferences"), async () => {
    const clearRecorder = createVoidArgumentRecorder<"classification" | "search" | "history" | "about" | "kanjiEntry">();
    const publishRecorder = createVoidArgumentRecorder<{ page: "classification"; mode: "image" }>();
    const languageRecorder = createVoidArgumentRecorder<string>();
    const themeRecorder = createVoidArgumentRecorder<"light" | "dark" | "system">();
    const drawingInferenceRecorder = createAsyncArgumentRecorder(TEST_PREDICTIONS.map(({ character, strokeCount }) => ({ character, strokeCount })));
    const imageSelectionRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropSelectionRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const navigationToKanjiRecorder = createVoidArgumentRecorder<string>();
    const historyRecorder = createVoidTupleRecorder<[string, "search" | "visitedEntry" | "imageClassification" | "drawingClassification"]>();

    const navigation = CreateNavigationController({
      clearPageState: (page) => {
        clearRecorder.handler(page);
        clearRegisteredCanvasState();
        clearRegisteredImageState();
        clearRegisteredInferenceDisplayState();
      },
      publishInitialRoute: publishRecorder.handler
    });
    const preferences = CreateUserPreferenceController({
      applyLanguage: languageRecorder.handler,
      applyTheme: themeRecorder.handler
    });
    const canvas = CreateCanvasController({
      requestDrawingInference: drawingInferenceRecorder.handler
    });
    const imageController = CreateImageController({
      onImageSelected: imageSelectionRecorder.handler,
      onCropSelected: cropSelectionRecorder.handler
    });
    const display = CreateDisplayInferencesController({
      navigateToKanjiEntry: navigationToKanjiRecorder.handler,
      saveHistoryEntry: historyRecorder.handler
    });

    // Precondition: user has configured preferences and the page has active state
    preferences.setLanguage(TEST_LANGUAGE);
    preferences.setTheme(TEST_THEME);
    await canvas.registerStroke(TEST_STROKE);
    imageController.setImage(TEST_IMAGE);
    imageController.setActiveCrop(TEST_CROP);
    display.updateResultsFromDrawingInference(TEST_PREDICTIONS);


    navigation.navigateTo("history");

    // Invariant: preferences are preserved; page state is not carried over
    expect(preferences.getCurrentPreferences().language).toBe(TEST_LANGUAGE,
      "NAVIGATION invariant failed: the selected language preference was not preserved across navigation."
    );
    expect(preferences.getCurrentPreferences().theme).toBe(TEST_THEME,
      "NAVIGATION invariant failed: the selected theme preference was not preserved across navigation."
    );

    // Postcondition: previous page state is cleared and preferences remain intact
    expect(canvas.getStrokeHistory()).toHaveLength(0,
      "NAVIGATION invariant failed: stroke history must be cleared immediately when navigating away from classification."
    );
    expect(imageController.getImageState().image).toBeNull(
      "NAVIGATION invariant failed: image must be cleared immediately when navigating away from classification."
    );

    navigation.navigateTo("classification");

    // Invariant: preferences are preserved; page state is not carried over
    expect(preferences.getCurrentPreferences().language).toBe(TEST_LANGUAGE,
      "NAVIGATION invariant failed: the selected language preference was not preserved across navigation."
    );
    expect(preferences.getCurrentPreferences().theme).toBe(TEST_THEME,
      "NAVIGATION invariant failed: the selected theme preference was not preserved across navigation."
    );

    // Postcondition: previous page state is cleared and preferences remain intact
    expect(clearRecorder.calls).toEqual(["history", "classification"],
      "NAVIGATION invariant failed: navigating between pages must clear the previous page state on each transition."
    );
    expect(canvas.getStrokeHistory()).toHaveLength(0,
      "NAVIGATION postcondition failed: stroke history from the previous page remained after navigation."
    );
    expect(imageController.getImageState().image).toBeNull(
      "NAVIGATION postcondition failed: an image from the previous page remained after navigation."
    );
    expect(imageController.getImageState().crop).toBeNull(
      "NAVIGATION postcondition failed: a crop from the previous page remained after navigation."
    );
    expect(display.getVisibleResults()).toHaveLength(0,
      "NAVIGATION postcondition failed: inference results from the previous page remained visible after navigation."
    );
  });
});
