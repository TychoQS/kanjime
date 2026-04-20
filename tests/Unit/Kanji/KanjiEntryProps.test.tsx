import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { KanjiEntryView } from "../../../src/Features/Kanji/KanjiEntryView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { TEST_KANJI_DETAILS } from "../../Support/TestData";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("KanjiEntryProps", () => {
  /**
   * Requirement: R5
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R5", "Unit", "Postcondition", "offers a visible copy mechanism"), async () => {
    const user = userEvent.setup();
    const copyCalls: string[] = [];

    renderWithIonic(
      <KanjiEntryView
        character={TEST_KANJI_DETAILS.character}
        meanings={TEST_KANJI_DETAILS.meanings ?? []}
        primaryReadings={[...(TEST_KANJI_DETAILS.kunyomi ?? []), ...(TEST_KANJI_DETAILS.onyomi ?? [])]}
        levels={[TEST_KANJI_DETAILS.jlptLevel ?? "", TEST_KANJI_DETAILS.joyoLevel ?? ""]}
        canCopy={true}
        canGoBack={true}
        onCopyRequested={() => {
          copyCalls.push(TEST_KANJI_DETAILS.character);
        }}
        onBackRequested={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(copyCalls).toEqual([TEST_KANJI_DETAILS.character], "KanjiEntryProps did not expose the copy interaction.");
  });

  /**
   * Requirement: R6
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R6", "Unit", "Postcondition", "offers a visible back-navigation mechanism"), async () => {
    const user = userEvent.setup();
    const backCalls: number[] = [];

    renderWithIonic(
      <KanjiEntryView
        character={TEST_KANJI_DETAILS.character}
        meanings={TEST_KANJI_DETAILS.meanings ?? []}
        primaryReadings={[...(TEST_KANJI_DETAILS.kunyomi ?? []), ...(TEST_KANJI_DETAILS.onyomi ?? [])]}
        levels={[TEST_KANJI_DETAILS.jlptLevel ?? "", TEST_KANJI_DETAILS.joyoLevel ?? ""]}
        canCopy={true}
        canGoBack={true}
        onCopyRequested={() => undefined}
        onBackRequested={() => {
          backCalls.push(backCalls.length + 1);
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(backCalls).toHaveLength(1, "KanjiEntryProps did not expose the back interaction.");
  });
});
