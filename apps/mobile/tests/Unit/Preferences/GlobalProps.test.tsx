import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getContrast } from "polished";

import { GlobalView } from "../../../src/Features/Preferences/GlobalView";
import { renderWithIonic } from "../../Support/RenderWithIonic";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import { WCAG_AAA_CONTRAST_THRESHOLD } from "../../Support/TestData";

/**
 * A "Contract Probe" that simulates a real app component.
 */
function GlobalContractProbe(): JSX.Element {
  return (
    <section data-testid="global-contract-probe">
      <h1 data-testid="localized-title">__TITLE_PLACEHOLDER__</h1>
      <div
        data-testid="themed-surface"
        style={{
          backgroundColor: "var(--app-background)",
          color: "var(--app-foreground)"
        }}
      >
        Contrast Check
      </div>
    </section>
  );
}

describe("GlobalProps", () => {
  const defaultProps = {
    language: "en-US" as const,
    theme: "light" as const,
    translationsReady: true,
  };

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R10", "Unit", "Precondition", "exists a configured language in the environment"), () => {
    renderWithIonic(
      <GlobalView {...defaultProps} language="en-US">
        <GlobalContractProbe />
      </GlobalView>
    );

    expect(screen.getByTestId("global-view")).toHaveAttribute("lang", "en-US");
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R10", "Unit", "Invariant", "all textual elements are rendered in the configured language consistently"), () => {
    const { rerender } = renderWithIonic(
      <GlobalView {...defaultProps} language="en-US">
        <GlobalContractProbe />
      </GlobalView>
    );

    expect(screen.getByTestId("localized-title")).toHaveTextContent("History");

    rerender(
      <GlobalView {...defaultProps} language="es-ES">
        <GlobalContractProbe />
      </GlobalView>
    );

    expect(screen.getByTestId("localized-title")).toHaveTextContent("Historial");
  });

  /**
   * Requirement: R10
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R10", "Unit", "Postcondition", "the final rendered text strictly matches the user's selected language"), () => {
    renderWithIonic(
      <GlobalView {...defaultProps} language="es-ES">
        <GlobalContractProbe />
      </GlobalView>
    );

    const title = screen.getByTestId("localized-title");
    expect(title).toHaveTextContent("Historial");
    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Precondition
   */
  it(buildRequirementTitle("R15", "Unit", "Precondition", "exists an active theme configured in the environment"), () => {
    renderWithIonic(
      <GlobalView {...defaultProps} theme="dark">
        <GlobalContractProbe />
      </GlobalView>
    );

    expect(screen.getByTestId("global-view")).toHaveAttribute("data-theme", "dark");
  });

  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Invariant
   */
  it(buildRequirementTitle("R15", "Unit", "Invariant", "contrast ratio is maintained across all components by following the theme palette"), () => {
    renderWithIonic(
      <GlobalView {...defaultProps} theme="dark">
        <GlobalContractProbe />
      </GlobalView>
    );

    const surface = screen.getByTestId("themed-surface");
    const style = window.getComputedStyle(surface);
    const bg = style.backgroundColor;
    const fg = style.color;

    const contrast = getContrast(bg, fg);
    expect(contrast).toBeGreaterThanOrEqual(WCAG_AAA_CONTRAST_THRESHOLD);
  });

  /**
   * Requirement: R15
   * Type: Unit
   * Condition: Postcondition
   */
  it(buildRequirementTitle("R15", "Unit", "Postcondition", "rendered components follow the established theme palette and styles"), () => {
    renderWithIonic(
      <GlobalView {...defaultProps} theme="dark">
        <GlobalContractProbe />
      </GlobalView>
    );

    const root = screen.getByTestId("global-view");
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(within(root).getByTestId("global-contract-probe")).toBeVisible();
  });
});
