import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NavigationView } from "../../../src/Features/Shell/NavigationView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";

describe("NavigationProps", () => {
  const defaultProps = {
    isMenuOpen: true,
    currentPage: "search" as const,
    availablePages: [
      { id: "classification" as const, label: "Classification" },
      { id: "search" as const, label: "Search" },
      { id: "history" as const, label: "History" },
      { id: "about" as const, label: "About" },
      { id: "calligraphy" as const, label: "Calligraphy" },
    ],
    onCloseRequested: vi.fn(),
    onNavigateRequested: vi.fn(),
  };

  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R8", "Unit", "Invariant", "the close control remains visible and accessible while the menu is active"), () => {
    renderWithIonic(<NavigationView {...defaultProps} />);
    expect(screen.getByRole("button", { name: /close/i })).toBeVisible();
  });

  /**
   * Requirement: R8
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R8", "Unit", "Postcondition", "successfully triggers the close callback when the user activates the close mechanism"), async () => {
    const user = userEvent.setup();
    const onCloseRequested = vi.fn();
    renderWithIonic(<NavigationView {...defaultProps} onCloseRequested={onCloseRequested} />);

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onCloseRequested).toHaveBeenCalled();
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R9", "Unit", "Invariant", "the current page highlight is exclusive and persists across UI interactions"), async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithIonic(<NavigationView {...defaultProps} />);

    const currentItems = screen.getAllByRole("menuitem").filter(el => el.getAttribute("aria-current") === "page");
    expect(currentItems).toHaveLength(1);
    expect(currentItems[0]).toHaveTextContent(/search/i);

    const menuHeader = screen.queryByRole("heading") || screen.getByRole("menu");
    await user.click(menuHeader);

    expect(screen.getByRole("menuitem", { name: /search/i })).toHaveAttribute("aria-current", "page");

    rerender(<NavigationView {...defaultProps} currentPage="history" />);
    expect(screen.getByRole("menuitem", { name: /history/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: /search/i })).not.toHaveAttribute("aria-current", "page");
  });

  /**
   * Requirement: R9
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R9", "Unit", "Postcondition", "accurately dispatches navigation requests with the correct target identifier"), async () => {
    const user = userEvent.setup();
    const onNavigateRequested = vi.fn();
    renderWithIonic(<NavigationView {...defaultProps} onNavigateRequested={onNavigateRequested} />);

    await user.click(screen.getByRole("menuitem", { name: /classification/i }));
    expect(onNavigateRequested).toHaveBeenCalledWith("classification");
  });
});
