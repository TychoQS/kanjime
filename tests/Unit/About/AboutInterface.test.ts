import { describe, expect, it } from "vitest";
import { CreateAboutController } from "../../../src/Features/About/CreateAboutController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { PROJECT_METADATA } from "../../Support/ProjectMetadata";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("AboutInterface", () => {

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R1", "Unit", "Invariant", "container is not empty when valid data exists"), async () => {
    const informationRecorder = createAsyncValueRecorder([...PROJECT_METADATA.aboutInformation]);
    const versionRecorder = createAsyncValueRecorder(PROJECT_METADATA.version);
    const controller = CreateAboutController({
      loadAboutInformation: informationRecorder.handler,
      loadApplicationVersion: versionRecorder.handler
    });

    const information = await controller.getAboutInformation();

    expect(information.length).toBeGreaterThan(
      0,
      "AboutInterface returned an empty informational payload."
    );
  });

  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Postcondition", "returns the exact informational payload"), async () => {
    const informationRecorder = createAsyncValueRecorder([...PROJECT_METADATA.aboutInformation]);
    const versionRecorder = createAsyncValueRecorder(PROJECT_METADATA.version);
    const controller = CreateAboutController({
      loadAboutInformation: informationRecorder.handler,
      loadApplicationVersion: versionRecorder.handler
    });

    const information = await controller.getAboutInformation();

    expect(information).toEqual(
      PROJECT_METADATA.aboutInformation,
      "AboutInterface did not return the exact expected payload."
    );
  });

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R2", "Unit", "Invariant", "keeps the displayed version synchronized"), async () => {
    const customSystemVersion = "9.9.9-test";
    const informationRecorder = createAsyncValueRecorder([...PROJECT_METADATA.aboutInformation]);
    const versionRecorder = createAsyncValueRecorder(customSystemVersion);
    const controller = CreateAboutController({
      loadAboutInformation: informationRecorder.handler,
      loadApplicationVersion: versionRecorder.handler
    });

    const version = await controller.getApplicationVersion();

    expect(version).toBe(
      customSystemVersion,
      "AboutInterface exposed an unexpected version value."
    );
  });
});