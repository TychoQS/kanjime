import { IonApp } from "@ionic/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminErrorsView } from "../../../src/Features/Errors/View/AdminErrorsView";
import { buildRequirementTitle } from "../../Support/RequirementTest";
import {
  TEST_ADMIN_ERROR_FILTERS,
  TEST_ADMIN_ERROR_STATUSES,
  TEST_ADMIN_ERROR_SUMMARIES
} from "../../Support/TestData";

describe("AdminErrorsProps requirements", () => {
  const baseProps = {
    errors: TEST_ADMIN_ERROR_SUMMARIES,
    isLoading: false,
    errorMessage: null,
    activeFilter: "all" as const,
    availableFilters: TEST_ADMIN_ERROR_FILTERS,
    availableStatuses: TEST_ADMIN_ERROR_STATUSES,
    onFilterSelected: vi.fn(),
    onErrorSelected: vi.fn()
  };

  function renderWithIonic(): void {
    render(
      <IonApp>
        <AdminErrorsView {...baseProps} />
      </IonApp>
    );
  }

  /**
   * Requirement R31 - Precondition (valid):
   * the administrator should be on the reported-errors screen with existing reports.
   */
  it(buildRequirementTitle("R31", "Unit", "Precondition", "the reported-errors screen renders existing reports"), () => {
    renderWithIonic();

    expect(
        screen.queryByText(TEST_ADMIN_ERROR_SUMMARIES[0].message),
        "R31 valid precondition should render an existing reported error on the administration errors screen."
    ).not.toBeNull();

    expect(
        screen.queryByText(TEST_ADMIN_ERROR_SUMMARIES[1].message),
        "R31 valid precondition should render another existing reported error on the administration errors screen."
    ).not.toBeNull();
  });

  /**
   * Requirement R31 - Invariant:
   * the visual filter "all" should stay separated from the real report statuses.
   */
  it(buildRequirementTitle("R31", "Unit", "Invariant", "the visual filter stays separated from the real statuses"), () => {
    renderWithIonic();

    expect(
        screen.queryByTestId("admin-errors-filter-all"),
        "R31 invariant should render a dedicated UI element for the visual filter \"all\"."
    ).not.toBeNull();

    expect(
        screen.queryByTestId("admin-error-status-all"),
        "R31 invariant should never render the visual filter \"all\" as a report row status."
    ).toBeNull();

    expect(
        screen.queryByTestId("admin-errors-status-open"),
        "R31 invariant should render a dedicated UI element for the real OPEN status."
    ).not.toBeNull();
  });

  /**
   * Requirement R31 - Postcondition:
   * the administrator should clearly distinguish the real statuses from the visual filter.
   */
  it(buildRequirementTitle("R31", "Unit", "Postcondition", "the administrator can distinguish the real statuses from the visual filter"), () => {
    renderWithIonic();

    expect(
        screen.queryByText("OPEN"),
        "R31 postcondition should show OPEN as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("IN_PROGRESS"),
        "R31 postcondition should show IN_PROGRESS as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("RESOLVED"),
        "R31 postcondition should show RESOLVED as a real report status."
    ).not.toBeNull();

    expect(
        screen.queryByText("DISCARDED"),
        "R31 postcondition should show DISCARDED as a real report status."
    ).not.toBeNull();
  });
});
