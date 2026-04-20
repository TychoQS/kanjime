import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingScreenView } from "../../../src/Features/Shell/LoadingScreenView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("LoadingScreenProps", () => {
  /**
   * Requirement: R7
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R7", "Unit", "Postcondition", "shows a visible blocking loading state"), () => {
    renderWithIonic(
      <LoadingScreenView
        isVisible={true}
        message="Loading packaged model"
        blocksInteraction={true}
      />
    );

    expect(screen.getByText("Loading packaged model")).toBeInTheDocument();
  });
});
