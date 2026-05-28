# Iteration 3 — Mobile Context (Observability & Version Management)

## 1. Purpose

This iteration implements the Observability and Version Management features for the mobile application.

Observability enables the application to capture unexpected errors automatically and generate structured reports containing enough information to diagnose and trace the failure. The report is persisted by calling an injected `saveReport` dependency. The `CompositionRoot` wires this dependency to `ObservabilityPersistence`. No feature code changes are required if the wiring is updated later.

Version management allows the application to check on startup whether the running version is up to date, inform the user when an update is available, and handle gracefully any connectivity failure during that check by falling back to the last known configuration.

---

## 2. Feature order (MANDATORY)

1. Error Observability
2. Error Handling
3. Version Check
4. Update Available

---

## 3. Features

### Feature: Error Observability

**Requirements**
- Functional: R61

**Description**
When an error is captured by the application, a structured report must be generated. The report must include: error message, ISO date of occurrence, application version, web engine name and version, and the last ten user actions as basic execution context.

The application version must be obtained using `@capacitor/app` — `App.getInfo()`. The web engine name and version must be obtained using `@capacitor/device` — `Device.getInfo()`. The last ten user actions must be tracked as a rotating buffer updated on each relevant user interaction and passed as context when generating the report.

The report is persisted by calling an injected `saveReport` dependency. The `CompositionRoot` wires this dependency to `ObservabilityPersistence`. The feature code has no knowledge of the storage mechanism and requires no changes if the wiring is updated.

All Capacitor plugin calls (`App.getInfo`, `Device.getInfo`) and the persistence write must be injected as dependencies so they can be mocked in tests.

**Dependencies**
- None

**Interface / Contracts**
(For the conditions go to the `.requirements` directory — `ErrorObservabilityInterface`)

---

### Feature: Error Handling

**Requirements**
- Functional: R60
- Component: R25

**Description**
The application must capture uncontrolled errors produced during component execution using a React error boundary placed at the root of the application. When an error is captured, the Error Observability feature must be triggered to generate and persist the report. The error boundary must not leave the application blank or trigger a second failure. The user must see a controlled error interface with a clear, non-technical message.

**Dependencies**
- Error Observability

**Interface / Contracts**
(For the conditions go to the `.requirements` directory — `ErrorInterface`, `ErrorProps`)

---

### Feature: Version Check

**Requirements**
- Functional: R57, R59

**Description**
On application startup, the version check must determine whether the running version is the latest available. The version configuration must be fetched from a remote source injected as a dependency. If the fetch fails or there is no connection, the application must fall back to the last configuration stored locally via `ObservabilityPersistence`. The version check must not block normal application access under any circumstance.

The current application version must be obtained using `@capacitor/app` — `App.getInfo()`. The remote configuration fetch and the Capacitor plugin call must be injected as dependencies.

The version check must not execute if no current application version is defined.

**Dependencies**
- None

**Interface / Contracts**
(For the conditions go to the `.requirements` directory — `VersionCheckInterface`)

---

### Feature: Update Available

**Requirements**
- Functional: R58
- Component: R24

**Description**
When the running version is older than the latest available version according to the version check result, the application must display a non-blocking informational notice to the user. The notice must not prevent normal application use. The message shown must not include technical terms or internal version identifiers beyond what the user needs to understand that an update exists.

**Dependencies**
- Version Check

**Interface / Contracts**
(For the conditions go to the `.requirements` directory — `UpdateAvailableInterface`, `UpdateAvailableProps`)

---

## 4. Dependencies (explicit graph)

- Error Observability → no dependencies
- Error Handling → depends on Error Observability
- Version Check → no dependencies
- Update Available → depends on Version Check

---

## 5. Persistence rules

- `AppPersistence` (`apps/mobile/src/Shared/AppPersistence.ts`) must not be modified. It owns user preferences and history and has no responsibility over observability or version data.
- A shared repository interface must be created at `packages/shared/src/ObservabilityRepository.ts`. It defines the operations available to both apps: `saveErrorReport`, `listErrorReports`, `getErrorReport`, `saveVersionConfiguration`, and `getVersionConfiguration`. Both apps depend on this interface, never on a concrete implementation.
- A new dedicated implementation must be created at `apps/mobile/src/Shared/`. This class implements `ObservabilityRepository` and uses `@capacitor/preferences` as its storage mechanism. It is specific to the mobile app.
- No external service, Firebase, Supabase, or any remote backend must be used or assumed in the mobile implementation.
- Do not invent URLs, API keys, or remote endpoints.
- The remote version configuration fetch must be injected as a dependency in the controller, not hardcoded. The `CompositionRoot` wires this dependency. The controller has no knowledge of the fetch mechanism and requires no changes if the wiring is updated.

---

## 6. Capacitor rules

- Application version must be retrieved using `@capacitor/app` — `App.getInfo()` — injected as a dependency
- Web engine name and version must be retrieved using `@capacitor/device` — `Device.getInfo()` — injected as a dependency
- Local persistence must use `ObservabilityPersistence` which wraps `@capacitor/preferences`
- All Capacitor plugin calls must be injected as dependencies so they can be mocked in Vitest without `vi.mock`

---

## 7. Shared types and interfaces

The following must exist in `packages/shared/src/` before or during this iteration. If they are already declared, do not redeclare them.

**Types**
- `VersionConfiguration` — `{ currentVersion: string; latestVersion: string; minimumSupportedVersion: string; updatedAt: string }`
- `VersionCheckResult` — `{ configuration: VersionConfiguration | null; isCurrentVersionDefined: boolean; isUpdateAvailable: boolean; isSupported: boolean; usedLastKnownConfiguration: boolean }`
- `ErrorReport` — `{ message: string; occurredAt: string; applicationVersion: string; webEngine: string; webEngineVersion: string; context: ErrorExecutionContext }`
- `ErrorExecutionContext` — `{ applicationVersion: string; webEngine: string; webEngineVersion: string; lastActions: ReadonlyArray<string> }`

**Interface**
- `ObservabilityRepository` — defines the persistence contract consumed by both apps:
  - `saveErrorReport(report: ErrorReport): Promise<void>`
  - `listErrorReports(): Promise<ReadonlyArray<ErrorReport>>`
  - `getErrorReport(id: string): Promise<ErrorReport | null>`
  - `saveVersionConfiguration(config: VersionConfiguration): Promise<void>`
  - `getVersionConfiguration(): Promise<VersionConfiguration | null>`

---

## 8. Integration rules

- A feature is only valid if it is reachable from the application
- The Error Handling error boundary must wrap the root of the application in `App.tsx` to capture all uncontrolled errors
- The Version Check must be wired into the application startup flow in `App.tsx` or `CompositionRoot.ts`
- The Update Available notice must be rendered conditionally from the application shell when the version check returns an available update
- No feature implemented in this iteration must interrupt, notify, or display any message to the user as a result of a missing or failed internet connection. Connectivity failures must be handled silently by the feature logic.
- No orphan features are allowed
- UI must reflect real application state
- A feature is INVALID if it passes tests but is not visible or usable in the UI
- Proposed code for the feature is only valid if it uses the components that are being tested within the tests for the iteration. Do not generate an implementation that is not being tested.

---

## 9. Definition of Done

A feature is complete only if:

- Tests pass
- No regressions exist
- Contracts are respected
- Dependencies are implemented and used
- Feature is integrated into the application
- Feature is reachable from UI or main flow
- No final stubs remain
- No hardcoded or test-specific logic exists
- Real implementation. Not just a mock implementation to pass tests and a separate implementation for the application. The implementation must use the current contracts and their current implementations.

---

## 10. UI validation rules

### Layout / Structure

- No nested scroll containers
- No overlapping components blocking interaction
- All elements must remain within visible screen bounds

### Data / State

- UI must be driven by real application state
- No placeholder or static data allowed in final UI
- UI must update after user interaction

### Error / Edge cases

- Empty states must be handled explicitly
- Errors must display clear, non-technical messages to the user
- UI must not break when data is missing or undefined

### Invalid UI conditions

The UI is invalid if:

- Elements are not clickable due to layout issues
- Components are duplicated unintentionally
- UI does not update after state changes
- UI shows stale or inconsistent data
- UI depends on hardcoded values

---

## 11. Architecture validation

After each feature, verify:

```bash
# No screen receives CompositionRoot directly
grep -rn "CompositionRoot" src/Features/ --include="*.tsx"

# No screen accesses data directly
grep -rn "root\." src/Features/ --include="*.tsx"
```

Both commands must return no matches for the feature to be valid.

---

## 12. Global constraints

- Requirements in `.requirements` are the source of truth
- Architecture rules are defined in `AGENTS.md`
- This file only defines execution order and constraints
- Do not hardcode outputs
- Do not create mocks or final stubs
- Exceptions must follow contract rules
- All text generated in any artifact must be strictly in English
- The only exception is i18n files, which must be in the corresponding language