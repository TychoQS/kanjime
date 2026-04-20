import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlobalView } from "../../../src/Features/Preferences/GlobalView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_LANGUAGE, TEST_THEME } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("GlobalProps", () => {
  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R10", "Unit", "Postcondition", "renders visible text using the active language"), () => {
    renderWithIonic(
      <GlobalView
        language={TEST_LANGUAGE}
        theme={TEST_THEME}
        translationsReady={true}
      />
    );

    expect(screen.getByText(TEST_LANGUAGE)).toBeInTheDocument();
  });

  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R15", "Unit", "Postcondition", "renders theme-aware visuals"), () => {
    renderWithIonic(
      <GlobalView
        language={TEST_LANGUAGE}
        theme={TEST_THEME}
        translationsReady={true}
      />
    );

    expect(screen.getByText(TEST_THEME)).toBeInTheDocument();
  });
});
