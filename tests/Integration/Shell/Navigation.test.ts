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

describe("NAVIGATION", () => {
  /**
   * Requirement: NAVIGATION
   * Type: Integration
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("NAVIGATION", "Integration", "Postcondition", "clears page state while preserving user preferences"), async () => {
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
      clearPageState: clearRecorder.handler,
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

    preferences.setLanguage(TEST_LANGUAGE);
    preferences.setTheme(TEST_THEME);
    await canvas.registerStroke(TEST_STROKE);
    imageController.setImage(TEST_IMAGE);
    display.updateResultsFromDrawingInference(TEST_PREDICTIONS);
    navigation.navigateTo("history");

    expect(clearRecorder.calls).toEqual(["history"], "Navigation flow did not clear the previous page state.");
    expect(preferences.getCurrentPreferences().language).toBe(
      TEST_LANGUAGE,
      "Navigation flow did not preserve the selected language."
    );
    expect(preferences.getCurrentPreferences().theme).toBe(TEST_THEME, "Navigation flow did not preserve the selected theme.");
    expect(canvas.getStrokeHistory()).toHaveLength(0);
    expect(imageController.getImageState().image).toBeNull();
    expect(display.getVisibleResults()).toHaveLength(0);
  });
});
