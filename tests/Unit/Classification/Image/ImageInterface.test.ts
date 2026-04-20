import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../../src/Features/Classification/Image/CreateImageController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ImageInterface", () => {
  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R19", "Unit", "Postcondition", "removes the current image without inference"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    controller.clearImage();

    expect(controller.getImageState().image).not.toBeNull();
    expect(controller.getImageState().image).toBeNull();
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R20", "Unit", "Invariant", "keeps the original image and updates the active crop"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    controller.setActiveCrop(TEST_CROP);

    expect(controller.getImageState().image).toEqual(TEST_IMAGE, "ImageInterface changed the original image state.");
    expect(controller.getImageState().crop).toEqual(TEST_CROP, "ImageInterface did not keep the selected crop.");
  });

  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R21", "Unit", "Postcondition", "stores a new image and invalidates old crops"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);

    expect(imageRecorder.calls).toHaveLength(1, "ImageInterface did not forward the selected image.");
    expect(controller.getImageState().image).toEqual(TEST_IMAGE, "ImageInterface did not store the selected image.");
    expect(controller.getImageState().crop).toBeNull("ImageInterface kept an outdated crop.");
  });
});
