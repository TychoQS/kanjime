import { describe, expect, it } from "vitest";

import { CreateDisplayKanjiController } from "../../../src/Features/Kanji/CreateDisplayKanjiController";
import { createAsyncArgumentRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_KANJI_DETAILS, TEST_PRIMARY_CHARACTER } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("DisplayKanjiInterface", () => {
  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R12", "Unit", "Postcondition", "returns all stored fields for a selected kanji"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    const details = await controller.getKanjiDetails(TEST_PRIMARY_CHARACTER);

    expect(detailsRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER], "DisplayKanjiInterface did not query the selected kanji.");
    expect(details).toEqual(TEST_KANJI_DETAILS, "DisplayKanjiInterface did not expose the complete kanji entry.");
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R13", "Unit", "Postcondition", "copies the selected kanji character"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    await controller.copyKanjiCharacter(TEST_PRIMARY_CHARACTER);

    expect(copyRecorder.calls).toEqual([TEST_PRIMARY_CHARACTER], "DisplayKanjiInterface did not forward the copy request.");
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R14", "Unit", "Postcondition", "returns to the previous screen while preserving state"), () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    controller.returnToPreviousScreen();

    expect(backRecorder.calls).toHaveLength(1, "DisplayKanjiInterface did not navigate back to the previous screen.");
  });
});
