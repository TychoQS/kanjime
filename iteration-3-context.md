# Iteration 3 — Admin Context

## 1. Purpose

This iteration implements the administration side of the observability and version management module. This iteration must implement the administration application so the administrator can inspect the technical state of the system, consult reported errors, inspect error details, read the current version configuration, and update the version configuration.

The admin app is a separate application inside the monorepo. It must use the shared domain types and contracts from `@kanjime/shared`, and it must follow the same architecture style used in the project: feature folders, contracts, viewmodels/controllers, view components, dependency injection and unidirectional data flow.

The admin app must not implement a complete authentication flow in this iteration. Authentication, roles and production security rules are outside the scope of this loop unless they already exist in the project.

The admin app must not rework the mobile implementation.


---

## 2. Feature order (MANDATORY)

1. Admin Versions
2. Admin Version Form
3. Admin Errors
4. Admin Error Detail
5. Admin Dashboard
6. Admin Shell integration

Do not start the next feature until the current feature passes its affected unit tests, builds correctly, and is integrated through its real View component.

---

## 3. Features

### Feature: Admin Versions

**Requirements**

* Functional: R63
* Usability: R26

**Description**
Allows the administrator to consult the current version configuration of the application.

The feature receives a valid `VersionConfiguration` and exposes an `AdminVersionSummary` with:

* `currentVersion`
* `latestVersion`
* `minimumSupportedVersion`
* `updatedAt`

Reading the version configuration must not mutate the source configuration.

The UI must present the version information in a clear and ordered way. Each value must be visually identifiable by a clear label.

**Dependencies**

* `ObservabilityRepository.getVersionConfiguration`
* `VersionConfiguration`
* `AdminVersionSummary`

**Interface / Contracts**

Use the existing contracts:

* `AdminVersionsInterface`
* `AdminVersionsProps`

The feature must include a real View component:

* `AdminVersionsView`

`AdminVersionsView` must consume `AdminVersionsProps`.

Do not render the version summary inline inside `AdminShellView`.

---

### Feature: Admin Version Form

**Requirements**

* Functional: R64
* Usability: R27

**Description**
Allows the administrator to modify the version configuration used by the application.

The feature must:

* receive editable version values;
* validate the version format before saving;
* reject invalid version configurations;
* show a clear validation message for invalid versions;
* persist valid version configurations through the injected dependency.

The required version format is:

```txt
MAJOR.MINOR.PATCH
```

Examples of valid values:

```txt
1.0.0
1.1.0
0.9.0
```

Examples of invalid values:

```txt
invalid-version
1.0
v1.0.0
1.0.0-beta
```

Invalid values must not be saved.

**Dependencies**

* `ObservabilityRepository.saveVersionConfiguration`
* `VersionConfiguration`
* `AdminVersionFormState`

**Interface / Contracts**

Use the existing contracts:

* `AdminVersionFormInterface`
* `AdminVersionFormProps`

The validation state must expose:

* `currentVersion`
* `latestVersion`
* `minimumSupportedVersion`
* `validationMessage`
* `canSave`

The feature must include a real View component:

* `AdminVersionFormView`

`AdminVersionFormView` must consume `AdminVersionFormProps`.

Do not render the version form inline inside `AdminShellView`.

---

### Feature: Admin Errors

**Requirements**

* Functional: R65
* Usability: R28

**Description**
Allows the administrator to consult the list of application error reports.

The feature must read persisted error reports through the repository boundary and map them to `AdminErrorSummary`.

Each visible error summary must include enough information to identify the error:

* `id`
* `message`
* `occurredAt`
* `applicationVersion`
* `contextSummary`

The list must not expose raw execution context, full action payloads, stack traces, or sensitive user input.

**Dependencies**

* `ObservabilityRepository.listErrorReports`
* `ApplicationErrorReport`
* `AdminErrorSummary`

**Interface / Contracts**

Use the existing contracts:

* `AdminErrorsInterface`
* `AdminErrorsProps`

The feature must include a real View component:

* `AdminErrorsView`

`AdminErrorsView` must consume `AdminErrorsProps`.

Do not render the error list inline inside `AdminShellView`.

---

### Feature: Admin Error Detail

**Requirements**

* Functional: R66

**Description**
Allows the administrator to open the detail of a selected reported error.

The feature must read one persisted error report by id through the repository boundary and map it to `AdminErrorDetail`.

The detail must include:

* `id`
* `message`
* `occurredAt`
* `applicationVersion`
* basic execution context:

  * `applicationVersion`
  * `webEngine`
  * `webEngineVersion`
  * `lastActions`

The selected detail must correspond to the selected error id.

`lastActions` must use the shared typed `ApplicationUserAction` model. Do not convert actions into free-form labels in the domain layer.

**Dependencies**

* `ObservabilityRepository.getErrorReport`
* `ApplicationErrorReport`
* `ApplicationErrorContext`
* `ApplicationUserAction`
* `AdminErrorDetail`

**Interface / Contracts**

Use the existing contracts:

* `AdminErrorDetailInterface`
* `AdminErrorDetailProps`

The feature must include a real View component:

* `AdminErrorDetailView`

`AdminErrorDetailView` must consume `AdminErrorDetailProps`.

Do not render the error detail inline inside `AdminShellView`.

---

### Feature: Admin Dashboard

**Requirements**

* Functional: R62

**Description**
Shows a technical overview of the application.

The dashboard must expose version information and error information as separate sections.

The dashboard summary must include:

* `versionConfiguration`
* `reportedErrorCount`
* `latestReportedErrorAt`

The dashboard must derive this information from the same repository boundary used by the versions and errors features.

**Dependencies**

* `ObservabilityRepository.getVersionConfiguration`
* `ObservabilityRepository.listErrorReports`
* `AdminTechnicalSummary`
* `VersionConfiguration`

**Interface / Contracts**

Use the existing contract:

* `AdminDashboardInterface`

If it does not exist yet, create:

The feature must include a real View component:

* `AdminDashboardView`

`AdminDashboardView` must consume `AdminDashboardProps`.

Do not render the dashboard content inline inside `AdminShellView`.

---

### Feature: Admin Shell

**Requirements**

* Integration of R62, R63, R64, R65 and R66

**Description**
Integrates the admin features into the administration application.

The shell must provide a minimal navigation structure so the administrator can access:

* dashboard;
* versions;
* version form;
* errors list;
* error detail.

A tab or section-based layout is allowed, but only for navigation and composition. The shell must not implement the internal UI of each feature.

`AdminShellView` must compose the feature views. It must not render dashboard, version summary, version form, error list or error detail internals inline.

**Dependencies**

* Admin Dashboard
* Admin Versions
* Admin Version Form
* Admin Errors
* Admin Error Detail
* Admin repository implementation

**Interface / Contracts**

The shell may have its own dependencies contract, but feature views must receive their own Props contracts.

---

## 4. Dependencies (explicit graph)

- Admin Versions → depends on version configuration data.
- Admin Version Form → depends on Admin Versions and version configuration data.
- Admin Errors → depends on reported application errors.
- Admin Error Detail → depends on Admin Errors.
- Admin Dashboard → depends on Admin Versions and Admin Errors.
- Admin Shell → depends on Admin Dashboard, Admin Versions, Admin Version Form, Admin Errors and Admin Error Detail.

---

## 5. Repository and data access rules

* The persistence boundary is `ObservabilityRepository`
* Admin must not import mobile persistence
* Admin must not use `@capacitor/preferences`
* Admin must not import anything from `apps/mobile`
* Admin must not invent Firebase URLs, API keys, Supabase clients or remote endpoints
* Admin must not hardcode test data as final implementation
* Admin may use a local browser storage implementation only as an admin-side repository adapter prepared to be replaced by backend/Firebase wiring
* Feature code must depend on injected repository functions, not on concrete persistence classes

Preferred structure:

```txt
packages/shared/src/ObservabilityRepository.ts
  shared repository interface

apps/admin/src/Shared/AdminObservabilityRepository.ts
  admin repository implementation

apps/admin/src/CompositionRoot.ts
  creates repository instance
  creates controllers
  exposes dependencies required by the shell
```

---

## 6. Integration rules

* A feature is only valid if it is reachable from the admin application
* Features must be integrated into `App`, `CompositionRoot`, shell, or main admin flow
* No orphan features are allowed
* UI must reflect real application state
* A feature is invalid if it passes tests but is not visible or usable in the UI
* Proposed code for the feature is only valid if it uses the components and contracts that are being tested within the tests for the iteration
* Do not generate an implementation that bypasses the tested contracts
* Props contracts must not be used only in tests
* Every Props contract must be consumed by a real production View component
* `AdminShellView` must not render all feature internals inline
* The shell is an orchestrator, not the implementation of every feature UI

---

## 7. Definition of Done

A feature is complete only if:

* Tests pass
* Build passes
* No regressions exist
* Contracts are respected
* Dependencies are implemented and used
* Feature is integrated into the admin application
* Feature is reachable from UI or main flow
* No final stubs remain
* No hardcoded or test-specific logic exists
* Real implementation exists
* The implementation uses the current contracts and their current implementations
* The corresponding Props contract is consumed by a production View component
* The feature View is used by the admin shell
* The feature UI is not rendered inline inside `AdminShellView`
---

## 8. UI validation rules

### Layout / Structure

* No nested scroll containers
* No overlapping components blocking interaction
* All elements must remain within visible screen bounds
* Shell navigation must not hide or duplicate feature content
* Feature sections must be visually separated and understandable

### Data / State

* UI must be driven by real application state
* No placeholder or static data allowed in final UI
* UI must update after user interaction
* Version form must update validation state when inputs change
* Error detail must correspond to the selected error id

### Error / Edge cases

* Empty states must be handled explicitly
* Missing version configuration must be handled explicitly
* Repository failures must display clear, non-technical admin-facing messages
* UI must not break when data is missing or undefined

### Invalid UI conditions

The UI is invalid if:

* Elements are not clickable due to layout issues
* Components are duplicated unintentionally
* UI does not update after state changes
* UI shows stale or inconsistent data
* UI depends on hardcoded values
* UI bypasses the tested Props contracts
* The shell renders feature internals directly instead of composing feature Views

---

## 9. Architecture validation

After each feature, verify:

```bash
# No unfinished implementation remains
grep -rn "Not implemented yet" apps/admin/src

# Admin must not import mobile code
grep -rn "apps/mobile" apps/admin/src

# No feature view accesses a root object directly
grep -rn "root\." apps/admin/src/Features --include="*.tsx"

# Props contracts must be consumed by production TSX components
grep -rn "AdminDashboardProps" apps/admin/src --include="*.tsx"
grep -rn "AdminVersionsProps" apps/admin/src --include="*.tsx"
grep -rn "AdminVersionFormProps" apps/admin/src --include="*.tsx"
grep -rn "AdminErrorsProps" apps/admin/src --include="*.tsx"
grep -rn "AdminErrorDetailProps" apps/admin/src --include="*.tsx"
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
* Do not bypass contracts by rendering domain objects directly in the shell when a Props contract exists