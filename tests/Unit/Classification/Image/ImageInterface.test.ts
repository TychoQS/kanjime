import { describe, expect, it } from "vitest";

import { CreateImageController } from "../../../../src/Features/Classification/Image/CreateImageController";
import { createVoidArgumentRecorder } from "../../../Support/DependencyFactories";
import { TEST_CROP, TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ImageInterface", () => {
  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R19", "Unit", "Precondition", "verifies an image exists before clearing"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    expect(controller.getImageState().image).not.toBeNull("ImageInterface had no image loaded before clearing.");
  });

  /**
 * Requirement: R19
 * Type: Unit
 * Condition: Precondition
 */
  it(buildRequirementTitle("R19", "Unit", "Precondition", "fails or is no-op when clearing an empty image state"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    expect(() => controller.clearImage()).not.toThrow();
    expect(controller.getImageState().image).toBeNull();
  });

  /**
   * Requirement: R19
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R19", "Unit", "Postcondition", "image is null after clearing"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    controller.clearImage();

    expect(controller.getImageState().image).toBeNull("ImageInterface did not clear the current image.");
  });

  /**
 * Requirement: R20
 * Type: Unit
 * Condition: Precondition - valid
 */
  it(buildRequirementTitle("R20", "Unit", "Precondition", "image is loaded and crop is within bounds"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);

    expect(controller.getImageState().image).not.toBeNull(
      "ImageInterface had no image loaded before setting a crop."
    );

    const withinBounds =
      TEST_CROP.x >= 0 &&
      TEST_CROP.y >= 0 &&
      TEST_CROP.x + TEST_CROP.width <= TEST_IMAGE.width &&
      TEST_CROP.y + TEST_CROP.height <= TEST_IMAGE.height;

    expect(withinBounds).toBe(true,
      "TEST_CROP exceeds the bounds of TEST_IMAGE."
    );
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Precondition - invalid
   */
  it(buildRequirementTitle("R20", "Unit", "Precondition", "crop outside image bounds is rejected"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);

    const outOfBoundsCrop = {
      x: TEST_IMAGE.width + 100,
      y: TEST_IMAGE.height + 100,
      width: 50,
      height: 50
    };

    expect(() => controller.setActiveCrop(outOfBoundsCrop)).toThrow(
      "ImageInterface accepted a crop outside the image bounds."
    );
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R20", "Unit", "Invariant", "original image remains unchanged after setting crop"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    controller.setActiveCrop(TEST_CROP);

    expect(controller.getImageState().image).toEqual(
      TEST_IMAGE,
      "ImageInterface changed the original image after setting a crop."
    );
    expect(controller.getImageState().crop).toEqual(TEST_CROP, "ImageInterface did not keep the selected crop.");
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R20", "Unit", "Invariant", "overwrites previous crop when a new one is selected"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);

    const firstCrop = { x: 0, y: 0, width: 10, height: 10 };
    const secondCrop = { x: 50, y: 50, width: 20, height: 20 };

    controller.setActiveCrop(firstCrop);
    controller.setActiveCrop(secondCrop);

    expect(controller.getImageState().crop).toEqual(
      secondCrop,
      "ImageInterface did not overwrite the previous crop with the new selection."
    );
    expect(controller.getImageState().crop?.width).toBe(secondCrop.width);
    expect(controller.getImageState().crop?.height).toBe(secondCrop.height);
  });

  /**
   * Requirement: R20
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R20", "Unit", "Postcondition", "selected crop is stored as active input"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);
    controller.setActiveCrop(TEST_CROP);

    expect(controller.getImageState().crop).toEqual(
      TEST_CROP,
      "ImageInterface did not store the selected crop as active input."
    );

    expect(cropRecorder.calls).toHaveLength(
      1,
      "ImageInterface did not trigger the onCropSelected callback."
    );
    expect(cropRecorder.calls[0]).toEqual(TEST_CROP);
  });

  /**
 * Requirement: R21
 * Type: Unit
 * Condition: Invariant
 */
  it(buildRequirementTitle("R21", "Unit", "Invariant", "does not mutate the input image object"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: () => { }
    });

    const imageInput = { ...TEST_IMAGE };
    const originalCopy = JSON.parse(JSON.stringify(TEST_IMAGE));

    controller.setImage(imageInput);

    expect(imageInput).toEqual(originalCopy,
      "ImageInterface mutated the input image object, violating immutability principles."
    );
  });


  /**
   * Requirement: R21
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R21", "Unit", "Postcondition", "stores a new image and invalidates old crops"), () => {
    const imageRecorder = createVoidArgumentRecorder<typeof TEST_IMAGE>();
    const cropRecorder = createVoidArgumentRecorder<typeof TEST_CROP>();
    const controller = CreateImageController({
      onImageSelected: imageRecorder.handler,
      onCropSelected: cropRecorder.handler
    });

    controller.setImage(TEST_IMAGE);

    expect(controller.getImageState().image).toEqual(TEST_IMAGE,
      "ImageInterface did not store the selected image."
    );
    expect(controller.getImageState().crop).toBeNull(
      "ImageInterface kept an outdated crop after setting a new image."
    );
  });
});
