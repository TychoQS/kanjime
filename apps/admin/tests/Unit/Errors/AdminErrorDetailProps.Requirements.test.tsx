import { IonApp } from "@ionic/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminErrorDetailView } from "../../../src/Features/Errors/View/AdminErrorDetailView";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_ADMIN_ERROR_DETAIL,
  TEST_ADMIN_ERROR_STATUSES
} from "../../Support/TestData";

describe("AdminErrorDetailProps requirements", () => {
  const baseProps = {
    detail: TEST_ADMIN_ERROR_DETAIL,
    isLoading: false,
    errorMessage: null,
    availableStatuses: TEST_ADMIN_ERROR_STATUSES,
    onStatusSelected: vi.fn(),
    onBackRequested: vi.fn()
  };

  function renderWithIonic(): void {
    render(
      <IonApp>
        <AdminErrorDetailView {...baseProps} />
      </IonApp>
    );
  }

  /**
   * Requirement R32 - Precondition (valid):
   * the administrator should be on the detail screen of an existing error report.
   */
  it(buildRequirementTitle("R32", "Unit", "Precondition", "the error-detail screen renders the selected report detail"), () => {
    renderWithIonic();

    expect(
        screen.queryByText(TEST_ADMIN_ERROR_DETAIL.message),
        "R32 valid precondition should render the selected reported error detail."
    ).not.toBeNull();

    expect(
        screen.queryByText(TEST_ADMIN_ERROR_DETAIL.id),
        "R32 valid precondition should expose the selected reported error identifier in the detail screen."
    ).not.toBeNull();
  });

  /**
   * Requirement R32 - Invariant:
   * the visual filter "all" should stay separated from the real detail statuses.
   */
  it(buildRequirementTitle("R32", "Unit", "Invariant", "the detail screen keeps real statuses separated from list-only filters"), () => {
    renderWithIonic();

    expect(
        screen.queryByTestId("admin-error-detail-status-open"),
        "R32 invariant should render a dedicated element for the OPEN status."
    ).not.toBeNull();

    expect(
        screen.queryByText("all"),
        "R32 invariant should not render the visual filter \"all\" as a selectable detail status."
    ).toBeNull();

    expect(
        screen.queryByTestId("admin-error-detail-filter-all"),
        "R32 invariant should not render the list-only filter as a detail status element."
    ).toBeNull();
  });

  /**
   * Requirement R32 - Postcondition:
   * the administrator should distinguish the real statuses on the detail screen.
   */
  it(buildRequirementTitle("R32", "Unit", "Postcondition", "the administrator can distinguish the real statuses on the detail screen"), () => {
    renderWithIonic();

    expect(
        screen.queryByText("OPEN"),
        "R32 postcondition should render OPEN as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("IN_PROGRESS"),
        "R32 postcondition should render IN_PROGRESS as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("RESOLVED"),
        "R32 postcondition should render RESOLVED as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("DISCARDED"),
        "R32 postcondition should render DISCARDED as a real report status."
    ).not.toBeNull();
  });
});
