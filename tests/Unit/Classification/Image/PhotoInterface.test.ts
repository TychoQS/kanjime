import { describe, expect, it } from "vitest";

import { CreatePhotoController } from "../../../../src/Features/Classification/Image/CreatePhotoController";
import { createAsyncValueRecorder } from "../../../Support/DependencyFactories";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("PhotoInterface", () => {
  /**
   * Requirement: R29
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R29", "Unit", "Postcondition", "captures an image from the camera"), async () => {
    const cameraRecorder = createAsyncValueRecorder(TEST_IMAGE);
    const libraryRecorder = createAsyncValueRecorder(TEST_IMAGE);
    const controller = CreatePhotoController({
      captureFromCamera: cameraRecorder.handler,
      pickFromLibrary: libraryRecorder.handler
    });

    const image = await controller.capturePhoto();

    expect(cameraRecorder.calls.length).toBeGreaterThan(0, "PhotoInterface did not request a camera capture.");
    expect(image).toEqual(TEST_IMAGE, "PhotoInterface returned an unexpected captured image.");
  });

  /**
   * Requirement: R30
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R30", "Unit", "Postcondition", "loads an image from the library"), async () => {
    const cameraRecorder = createAsyncValueRecorder(TEST_IMAGE);
    const libraryRecorder = createAsyncValueRecorder(TEST_IMAGE);
    const controller = CreatePhotoController({
      captureFromCamera: cameraRecorder.handler,
      pickFromLibrary: libraryRecorder.handler
    });

    const image = await controller.pickPhotoFromLibrary();

    expect(libraryRecorder.calls.length).toBeGreaterThan(0, "PhotoInterface did not request a library image.");
    expect(image).toEqual(TEST_IMAGE, "PhotoInterface returned an unexpected library image.");
  });
});
