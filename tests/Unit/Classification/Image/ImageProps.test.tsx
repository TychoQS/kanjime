import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageView } from "../../../../src/Features/Classification/Image/ImageView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_IMAGE } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("ImageProps", () => {
  /**
   * Requirement: R13
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R13", "Unit", "Invariant", "keeps the selected image visible while processing"), () => {
    renderWithIonic(
      <ImageView
        image={{
          uri: TEST_IMAGE.uri,
          width: TEST_IMAGE.width,
          height: TEST_IMAGE.height,
          altText: TEST_IMAGE.uri
        }}
        isProcessing={true}
        onClearImage={() => undefined}
      />
    );

    expect(screen.getByAltText(TEST_IMAGE.uri)).toBeInTheDocument();
  });
});
