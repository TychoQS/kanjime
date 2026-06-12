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
   * the error-detail screen should render the real status options for the selected report.
   */
  it(buildRequirementTitle("R32", "Unit", "Precondition", "the error-detail screen renders the real status options"), () => {
    renderWithIonic();

    expect(
      screen.queryByText("OPEN"),
      "R32 valid precondition should render the current OPEN status for the selected report."
    ).not.toBeNull();
    expect(
      screen.queryByText("RESOLVED"),
      "R32 valid precondition should render RESOLVED as another real selectable status."
    ).not.toBeNull();
  });

  /**
   * Requirement R32 - Precondition (invalid):
   * the visual filter "all" should never appear as a selectable detail status.
   */
  it(buildRequirementTitle("R32", "Unit", "Precondition", "the visual filter all is not selectable in the detail screen"), () => {
    renderWithIonic();

    expect(
      screen.queryByText("all"),
      "R32 invalid precondition should not render the visual filter \"all\" as a selectable detail status."
    ).toBeNull();
  });

  /**
   * Requirement R32 - Invariant:
   * the real statuses should stay separated from list-only filters.
   */
  it(buildRequirementTitle("R32", "Unit", "Invariant", "the detail screen keeps real statuses separated from list-only filters"), () => {
    renderWithIonic();

    expect(
      screen.queryByTestId("admin-error-detail-status-open"),
      "R32 invariant should render a dedicated element for the OPEN status."
    ).not.toBeNull();
    expect(
      screen.queryByTestId("admin-error-detail-filter-all"),
      "R32 invariant should render the list-only filter separately from the real statuses when it needs to be referenced."
    ).toBeNull();
  });

  /**
   * Requirement R32 - Postcondition:
   * the administrator should distinguish the real statuses on the detail screen.
   */
  it(buildRequirementTitle("R32", "Unit", "Postcondition", "the administrator can distinguish the real statuses on the detail screen"), () => {
    renderWithIonic();

    expect(
      screen.queryByText("IN_PROGRESS"),
      "R32 postcondition should render IN_PROGRESS as a real report status."
    ).not.toBeNull();
    expect(
      screen.queryByText("DISCARDED"),
      "R32 postcondition should render DISCARDED as a real report status."
    ).not.toBeNull();
  });
});
