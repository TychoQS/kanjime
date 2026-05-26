import { describe, expect, it } from "vitest";

import { CreateDisplayKanjiController } from "../../../src/Features/Kanji/CreateDisplayKanjiController";
import { createAsyncArgumentRecorder, createVoidArgumentRecorder } from "../../Support/DependencyFactories";
import { TEST_KANJI_DETAILS, TEST_PRIMARY_CHARACTER, TEST_PARTIAL_KANJI_DETAILS, TEST_SECONDARY_CHARACTER } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("DisplayKanjiInterface", () => {
  /**
 * Requirement: R12
 * Type: Unit
 * Condition: Precondition
 */
  it(buildRequirementTitle("R12", "Unit", "Precondition", "rejects getKanjiDetails when no valid kanji is selected"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    await expect(controller.getKanjiDetails(""), "DisplayKanjiInterface did not reject invalid kanji selection.").rejects.toThrow();
    expect(detailsRecorder.calls, "DisplayKanjiInterface attempted to load a kanji entry when no valid selection was provided.").toHaveLength(0);
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R12", "Unit", "Invariant", "does not invent fields when passing a partial kanji"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_PARTIAL_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    const details = await controller.getKanjiDetails(TEST_SECONDARY_CHARACTER);

    expect(details.character).toBe(TEST_SECONDARY_CHARACTER);
    expect(details.strokeCount).toBe(5);
    expect(details).not.toHaveProperty("radical");
    expect(details).not.toHaveProperty("meanings");
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R12", "Unit", "Postcondition", "returns all available fields for the selected kanji"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();
    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    const details = await controller.getKanjiDetails(TEST_PRIMARY_CHARACTER);

    expect(details).toEqual(TEST_KANJI_DETAILS, "DisplayKanjiInterface did not expose the complete kanji entry.");
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R13", "Unit", "Precondition", "rejects copy when no valid kanji is selected"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    await expect(controller.copyKanjiCharacter(""), "DisplayKanjiInterface did not reject invalid kanji selection.").rejects.toThrow();
    expect(copyRecorder.calls, "DisplayKanjiInterface attempted to copy a kanji when no valid selection was provided.").toHaveLength(0);
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R13", "Unit", "Invariant", "does not alter application flow when copying the selected kanji"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    await controller.copyKanjiCharacter(TEST_PRIMARY_CHARACTER);

    expect(detailsRecorder.calls, "DisplayKanjiInterface unexpectedly reloaded kanji details during copy operation.").toHaveLength(0);
    expect(backRecorder.calls, "DisplayKanjiInterface unexpectedly triggered navigation during copy operation.").toHaveLength(0);
  });

  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R13", "Unit", "Postcondition", "copies the selected kanji character to the clipboard"), async () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    await controller.copyKanjiCharacter(TEST_PRIMARY_CHARACTER);

    expect(copyRecorder.calls).toEqual(
      [TEST_PRIMARY_CHARACTER],
      "DisplayKanjiInterface did not copy the selected kanji character."
    );
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R14", "Unit", "Precondition", "fails to return when no valid kanji selection context exists"), () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    expect(() => controller.returnToPreviousScreen()).toThrow();
    expect(backRecorder.calls).toHaveLength(0);
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R14", "Unit", "Invariant", "does not alter other application actions when returning to the previous screen"), () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    controller.returnToPreviousScreen();

    expect(detailsRecorder.calls).toHaveLength(
      0,
      "DisplayKanjiInterface unexpectedly reloaded kanji details when returning to the previous screen."
    );

    expect(copyRecorder.calls).toHaveLength(
      0,
      "DisplayKanjiInterface unexpectedly triggered a copy action when returning to the previous screen."
    );
  });

  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R14", "Unit", "Postcondition", "returns to the previous screen"), () => {
    const detailsRecorder = createAsyncArgumentRecorder<string, typeof TEST_KANJI_DETAILS>(TEST_KANJI_DETAILS);
    const copyRecorder = createVoidArgumentRecorder<string>();
    const backRecorder = createVoidArgumentRecorder<void>();

    const controller = CreateDisplayKanjiController({
      loadKanjiDetails: detailsRecorder.handler,
      copyToClipboard: copyRecorder.handler,
      navigateBack: () => backRecorder.handler(undefined)
    });

    controller.returnToPreviousScreen();

    expect(backRecorder.calls).toHaveLength(
      1,
      "DisplayKanjiInterface did not navigate back to the previous screen."
    );
  });
});
