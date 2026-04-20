import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SearchResultView } from "../../../src/Features/Search/SearchResultView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_SUMMARIES } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("SearchResultProps", () => {
  /**
   * Requirement: R11
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R11", "Unit", "Postcondition", "opens the selected kanji entry from a result row"), async () => {
    const user = userEvent.setup();
    const selectedCharacters: string[] = [];

    renderWithIonic(
      <SearchResultView
        character={TEST_SUMMARIES[0].character}
        mainReadings={TEST_SUMMARIES[0].primaryReadings}
        levels={TEST_SUMMARIES[0].levels}
        onSelected={(character) => {
          selectedCharacters.push(character);
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: TEST_SUMMARIES[0].character }));

    expect(selectedCharacters).toEqual([TEST_SUMMARIES[0].character], "SearchResultProps did not forward the selected result.");
  });

  /**
   * Requirement: R12
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R12", "Unit", "Postcondition", "shows the character, readings, and levels"), () => {
    renderWithIonic(
      <SearchResultView
        character={TEST_SUMMARIES[0].character}
        mainReadings={TEST_SUMMARIES[0].primaryReadings}
        levels={TEST_SUMMARIES[0].levels}
        onSelected={() => undefined}
      />
    );

    expect(screen.getByText(TEST_SUMMARIES[0].character)).toBeInTheDocument();
    expect(screen.getByText(TEST_SUMMARIES[0].primaryReadings[0])).toBeInTheDocument();
    expect(screen.getByText(TEST_SUMMARIES[0].levels[0])).toBeInTheDocument();
  });
});
