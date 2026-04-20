import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InferenceListView } from "../../../../src/Features/Classification/Inference/InferenceListView";
import { renderWithIonic } from "../../../Support/RenderWithIonic";
import { TEST_SUMMARIES } from "../../../Support/TestData";
import { buildRequirementTitle } from "../../../Support/RequirementTest";

describe("InferenceListProps", () => {
  /**
   * Requirement: R4
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R4", "Unit", "Postcondition", "opens the selected kanji from the result list"), async () => {
    const user = userEvent.setup();
    const resultSelected: string[] = [];

    renderWithIonic(
      <InferenceListView
        results={TEST_SUMMARIES.map((summary, index) => ({
          ...summary,
          isSelected: index === 0
        }))}
        onResultSelected={(character) => {
          resultSelected.push(character);
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: TEST_SUMMARIES[0].character }));

    expect(resultSelected).toEqual([TEST_SUMMARIES[0].character], "InferenceListProps did not forward the selected result.");
  });
});
