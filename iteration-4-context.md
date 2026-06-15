# Iteration 4 — Admin improvements

## 1. Purpose

This iteration improves the admin reports module app.

The admin app receives two improvements to the admin dashboard: The existence of state associated to reports and a filter to filter them in the report section.

This iteration must not rework existing features outside the scope described below. It must not break any passing test. And it must not change anything in the mobile app.

---

## 2. Feature order (MANDATORY)

### Admin

1. Report status visualization and filtering
2. Report status change

Do not start the next feature until the current feature passes its affected unit tests, builds correctly, and is integrated through its real View component.

---

## 3. Features

### Feature: Update error status

**Requirements**

* Functional: R72
* Usability: R32
  **Description**

Allows the administrator to change the status of a reported error from its detail screen.
Error status must be stored as a field of the existing Firestore error report document.

The feature must:

* accept a status from the allowed set: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `DISCARDED`;
* reject any value outside that set;
* persist the updated status through the injected dependency;
* return the updated `AdminErrorDetail` after a successful status change.
  The UI must:

* show the real assignable statuses clearly differentiated from any visualization-only filter;
* never expose `"all"` as an assignable status.
  **Dependencies**

* `AdminErrorDetailInterface.updateErrorStatus`
* `AdminErrorStatus`
* `AdminErrorDetail`

**Interface / Contracts**

Use the existing contracts:

* `AdminErrorDetailInterface`
* `AdminErrorDetailProps`
  `AdminErrorDetailProps` already exposes:

* `availableStatuses: ReadonlyArray<AdminErrorStatus>`
* `onStatusSelected: (status: AdminErrorStatus) => void`
  The View component that must consume `AdminErrorDetailProps` is:

* `AdminErrorDetailView`
---

### Feature: Filter errors by status

**Requirements**

* Functional: R73
* Usability: R31

**Description**

Allows the administrator to filter the error report list by a concrete status or show all reports.

The feature must:

* return only reports matching the selected status when a concrete status filter is applied;
* return all reports when the `"all"` filter is selected;
* never treat `"all"` as an assignable report status — it is a visualization-only filter.

**Dependencies**

* `AdminErrorsInterface.filterReportedErrors`
* `AdminErrorFilter`
* `AdminErrorSummary`

**Interface / Contracts**

Use the existing contracts:

* `AdminErrorsInterface`
* `AdminErrorDashboardProps`
  `AdminErrorDashboardProps` already exposes:

* `activeFilter: AdminErrorFilter`
* `availableFilters: ReadonlyArray<AdminErrorFilter>`
* `availableStatuses: ReadonlyArray<AdminErrorStatus>`
* `onFilterSelected: (filter: AdminErrorFilter) => void`
  The View component that must consume `AdminErrorDashboardProps` is:

* `AdminErrorsView`
  The `"all"` option must appear only in the filter selector, never in the assignable status list.
---

### Updates
Update the contracts and unit tests to take into consideration the new fields of a error report.
Both anonymousId and errorStatus, to be parsed and displayed as well as the rest of the fields and
update any unit tests for interface or prop that check for existences of report fields to check the new ones.

**Interface / Contracts**
* `AdminErrorDetailProps`

## 4. Dependencies (explicit graph)

- Update error status → depends on `AdminErrorDetailInterface.updateErrorStatus`.
- Filter errors → depends on `AdminErrorsInterface.filterReportedErrors` and Update error status (status set must be consistent).

---

## 5. Repository and data access rules

* Mobile must not import admin code.
* Admin must not import mobile code.
* Admin must not use `@capacitor/preferences`.
* Feature code must depend on injected repository functions, not on concrete persistence classes.
* No hardcoded test data as final implementation.
* No invented Firebase URLs, API keys, or remote endpoints.

---

## 6. Integration rules

* A feature is only valid if it is reachable from the running application.
* Features must be integrated into `App`, routing, composition root, or main flow.
* No orphan features are allowed.
* UI must reflect real application state.
* A feature is invalid if it passes tests but is not visible or usable in the UI.
* Props contracts must not be used only in tests.
* Every Props contract must be consumed by a real production View component.

---

## 7. Definition of Done

A feature is complete only if:

* Tests pass
* Build passes
* No regressions exist
* Contracts are respected
* Dependencies are implemented and used
* Feature is integrated into the application
* Feature is reachable from UI or main flow
* No final stubs remain
* No hardcoded or test-specific logic exists
* Real implementation exists
* The corresponding Props contract is consumed by a production View component


---

## 8. UI validation rules

### Layout / Structure

* No nested scroll containers
* No overlapping components blocking interaction
* All elements must remain within visible screen bounds
* The category search field must be visible without opening menus or additional screens
* The visual comparison must appear above the metric breakdown while evaluation feedback is visible
* The `"all"` filter option must be visually separated from the assignable status list

### Data / State

* UI must be driven by real application state
* No placeholder or static data allowed in final UI
* UI must update after user interaction
* Category list must filter reactively as the user types
* Error detail must reflect the updated status after a change
* Error list must update after a filter is applied

### Error / Edge cases

* Status changes must update the application state immediately after the persistence operation succeeds.
* The user must not need to reload the page, reopen the detail screen, reapply the filter, or manually refresh the report list to see the updated status.
* The detail screen and the report list must stay consistent after a status change.
* UI must not break when data is missing or undefined

### Invalid UI conditions

The UI is invalid if:

* The category search field is hidden or requires an extra tap to reveal
* The visual comparison does not appear above the metric breakdown
* The `"all"` option appears in the assignable status selector
* Status changes do not update the visible detail
* Filter changes do not update the visible error list
* UI depends on hardcoded values
* UI bypasses the tested Props contracts
* Alt text appearing as visible content where an image should be is an invalid state
* Both reference and attempt visuals must render as visible images, not empty boxes

---

## 9. Architecture validation

After each feature, verify:

```bash
# No unfinished implementation remains
grep -rn "Not implemented yet" apps/mobile/src apps/admin/src

# No cross-app imports
grep -rn "apps/mobile" apps/admin/src
grep -rn "apps/admin" apps/mobile/src

# No logic inside factory return objects
grep -rn "return {" apps/mobile/src/Features --include="Create*.ts"
grep -rn "return {" apps/admin/src/Features --include="Create*.ts"

# Props contracts consumed by production components
grep -rn "CategoryProps" apps/mobile/src --include="*.tsx"
grep -rn "CalligraphyEvaluationProps" apps/mobile/src --include="*.tsx"

# Search field is wired
grep -rn "onSearchTermChanged" apps/mobile/src --include="*.tsx"

# Homography must use OpenCV
grep -rn "findHomography\|warpPerspective" apps/mobile/src
# Must return at least one result. Zero results means homography is not implemented.
# An identity matrix [[1,0,0],[0,1,0],[0,0,1]] is also invalid — it means no real transform was computed.

# No SVG strings assigned to image URI fields
grep -rn "attemptImageUri\|referenceImageUri" apps/mobile/src --include="*.ts" | grep "<svg"
# Must return zero results.

# No placeholder URIs
grep -rn "attempt-image-uri-\|reference-image-uri-" apps/mobile/src
# Must return zero results.

```

These checks are part of the validity of the implementation. Passing tests is not enough if the implementation bypasses the tested contracts.

---

## 10. Global constraints

* Requirements in `.requirements` are the source of truth
* Architecture rules are defined in `AGENTS.md`
* This file only defines execution order and constraints
* Do not hardcode outputs
* Do not create mocks or final stubs
* Do not create duplicate domain types
* Do not introduce `any`
* Do not leave console logs
* Exceptions must follow contract rules
* Keep generated source text in English
* Do not bypass contracts by rendering domain objects directly in views when a Props contract exists
