import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NavigationView } from "../../../src/Features/Shell/NavigationView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";

const AVAILABLE_PAGES = [
  { id: "classification" as const, label: "Classification" },
  { id: "search" as const, label: "Search" },
  { id: "history" as const, label: "History" },
  { id: "about" as const, label: "About" },
  { id: "kanjiEntry" as const, label: "Kanji Entry" }
];

describe("NavigationProps", () => {
  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R8", "Unit", "Postcondition", "offers a visible mechanism to close the menu"), async () => {
    const user = userEvent.setup();
    const closeCalls: number[] = [];

    renderWithIonic(
      <NavigationView
        isMenuOpen={true}
        currentPage="classification"
        availablePages={AVAILABLE_PAGES}
        onCloseRequested={() => {
          closeCalls.push(closeCalls.length + 1);
        }}
        onNavigateRequested={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(closeCalls).toHaveLength(1, "NavigationProps did not expose the close action.");
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Precondition + Invariant + Postcondition
   */
  it(buildRequirementTitle("R9", "Unit", "Postcondition", "offers direct navigation targets in the side menu"), async () => {
    const user = userEvent.setup();
    const navigationCalls: string[] = [];

    renderWithIonic(
      <NavigationView
        isMenuOpen={true}
        currentPage="classification"
        availablePages={AVAILABLE_PAGES}
        onCloseRequested={() => undefined}
        onNavigateRequested={(page) => {
          navigationCalls.push(page);
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(navigationCalls).toEqual(["search"], "NavigationProps did not expose the selected navigation target.");
  });
});
