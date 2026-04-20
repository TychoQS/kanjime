import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CropOverlayView } from "../../../../src/Features/Classification/Image/CropOverlayView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_CROP } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("CropProps", () => {
  /**
   * Requirement: R14
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R14", "Unit", "Postcondition", "shows the active crop overlay"), () => {
    renderWithIonic(
      <CropOverlayView
        imageWidth={224}
        imageHeight={224}
        activeCrop={TEST_CROP}
        isVisible={true}
        onCropChanged={() => undefined}
      />
    );

    expect(screen.getByText(String(TEST_CROP.width))).toBeInTheDocument();
    expect(screen.getByText(String(TEST_CROP.height))).toBeInTheDocument();
  });
});
