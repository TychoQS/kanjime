import { describe, expect, it } from "vitest";

import { CreateAboutController } from "../../../src/Features/About/CreateAboutController";
import { createAsyncValueRecorder } from "../../Support/DependencyFactories";
import { PROJECT_METADATA } from "../../Support/ProjectMetadata";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("AboutInterface", () => {
  /**
   * Requirement: R1
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R1", "Unit", "Postcondition", "returns visible about information"), async () => {
    const informationRecorder = createAsyncValueRecorder([...PROJECT_METADATA.aboutInformation]);
    const versionRecorder = createAsyncValueRecorder(PROJECT_METADATA.version);
    const controller = CreateAboutController({
      loadAboutInformation: informationRecorder.handler,
      loadApplicationVersion: versionRecorder.handler
    });

    const information = await controller.getAboutInformation();

    expect(informationRecorder.calls.length).toBeGreaterThan(
      0,
      "AboutInterface did not request any informational payload."
    );
    expect(information.length).toBeGreaterThan(0, "AboutInterface returned an empty informational payload.");
    expect(information).toContainEqual(
      PROJECT_METADATA.aboutInformation[0],
      "AboutInterface did not expose the repository metadata."
    );
  });

  /**
   * Requirement: R2
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R2", "Unit", "Invariant", "keeps the displayed version synchronized"), async () => {
    const informationRecorder = createAsyncValueRecorder([...PROJECT_METADATA.aboutInformation]);
    const versionRecorder = createAsyncValueRecorder(PROJECT_METADATA.version);
    const controller = CreateAboutController({
      loadAboutInformation: informationRecorder.handler,
      loadApplicationVersion: versionRecorder.handler
    });

    const version = await controller.getApplicationVersion();

    expect(versionRecorder.calls.length).toBeGreaterThan(0, "AboutInterface never requested the project version.");
    expect(version).toBe(PROJECT_METADATA.version, "AboutInterface exposed an unexpected version value.");
    expect(version.length).toBeGreaterThan(0, "AboutInterface returned an empty version string.");
  });
});
