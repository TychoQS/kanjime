import { describe, expect, it } from "vitest";

import { CreatePhotoController } from "../../../../src/Features/Classification/Image/CreatePhotoController";
import { createAsyncValueRecorder } from "../../../Support/DependencyFactories";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("PhotoInterface", () => {

  /**
     * Requirement: R29
     * Type: Unit
     * Condition: Precondition
     */
  it(buildRequirementTitle("R29", "Unit", "Precondition", "handles camera permission denial gracefully"), async () => {
    const controller = CreatePhotoController({
      captureFromCamera: () => Promise.reject(new Error("Permission denied")),
      pickFromLibrary: () => Promise.resolve(TEST_IMAGE)
    });
    const image = await controller.capturePhoto();
    expect(image).toBeNull("PhotoInterface did not handle camera permission denial gracefully.");
  });

  /**
   * Requirement: R29
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R29", "Unit", "Invariant", "captures an image from the camera"), async () => {
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
 * Requirement: R29
 * Type: Unit
 * Condition: Postcondition
 */
  it(buildRequirementTitle("R29", "Unit", "Postcondition", "returned image matches exactly the camera output"), async () => {
    const controller = CreatePhotoController({
      captureFromCamera: () => Promise.resolve(TEST_IMAGE),
      pickFromLibrary: () => Promise.resolve(TEST_IMAGE)
    });
    const image = await controller.capturePhoto();
    expect(image).toEqual(TEST_IMAGE, "The returned image does not match the captured data.");
  });

  /**
   * Requirement: R30
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R30", "Unit", "Precondition", "handles library access denial gracefully"), async () => {
    const controller = CreatePhotoController({
      captureFromCamera: () => Promise.resolve(TEST_IMAGE),
      pickFromLibrary: () => Promise.reject(new Error("Access denied"))
    });

    const image = await controller.pickPhotoFromLibrary();
    expect(image).toBeNull("PhotoInterface did not handle library access denial gracefully.");
  });

  /**
   * Requirement: R30
   * Type: Unit
   * Condition: Invariant 
   */
  it(buildRequirementTitle("R30", "Unit", "Invariant", "loads an image from the library"), async () => {
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

  /**
 * Requirement: R30
 * Type: Unit
 * Condition: Postcondition
 */
  it(buildRequirementTitle("R30", "Unit", "Postcondition", "returned image matches exactly the library output"), async () => {
    const controller = CreatePhotoController({
      captureFromCamera: () => Promise.resolve(TEST_IMAGE),
      pickFromLibrary: () => Promise.resolve(TEST_IMAGE)
    });
    const image = await controller.pickPhotoFromLibrary();
    expect(image).toEqual(TEST_IMAGE, "The returned image does not match the library selection.");
  });

});
