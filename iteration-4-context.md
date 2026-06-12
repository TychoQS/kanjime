# Iteration 4 — Mobile improvements

## 1. Purpose

This iteration improves the mobile writing module.

The mobile app receives three improvements to the calligraphy feature: a kanji search field inside the category screen, a SIFT-based visual similarity metric, and a visual reference-attempt comparison shown after evaluation. The error observability flow is extended to attach an anonymous client identifier to generated reports.

This iteration must not rework existing features outside the scope described below. It must not break any passing test.

---

## 2. Feature order (MANDATORY)

### Mobile

1. Category search
2. SIFT similarity evaluation
3. Visual reference-attempt comparison
4. Anonymous client identifier in error reports

Do not start the next feature until the current feature passes its affected unit tests, builds correctly, and is integrated through its real View component.

---

## 3. Features

### Feature: Category search

**Requirements**

* Functional: R67
* Usability: R29

**Description**

Allows the user to search for kanji inside the selected category list.

The feature must:

* accept a non-empty search term in hiragana, katakana, or kanji;
* reject an empty term by throwing with a message containing `"valid search term"`;
* return only kanji matching the term that belong to the selected category;
* return an empty array when no kanji match the term;
* keep the search field visible before and after any filtering attempt.

**Dependencies**

* `CategoryInterface.searchKanjiByCategory`

**Interface / Contracts**

Use the existing contracts:

* `CategoryInterface`
* `CategoryProps`

`CategoryProps` already exposes:

* `searchTerm`
* `onSearchTermChanged`
* `visibleKanji`

The feature must wire these props so the list filters reactively as the user types.

The View component that must consume `CategoryProps` is:

* `CategoryView`

The search field must be visible on the kanji category list screen without opening any additional menu or screen.

---

### Feature: SIFT similarity evaluation

**Requirements**

* Functional: R68, R69

**Description**

Improves the general similarity metric of the writing evaluation by using a visual image-based comparison (SIFT or equivalent) between the rendered reference character and the user attempt.

The feature must:

* accept a finalized attempt and a renderable reference;
* reject a non-finalized attempt by throwing with a message containing `"finalized"`;
* return a `CalligraphySimilarityEvaluation` with `strategy: "SIFT"` when keypoints are sufficient;
* return a controlled fallback result with `strategy: "FALLBACK"` and `fallbackReason: "insufficient_keypoints"` when SIFT cannot find enough keypoints — it must never throw an uncontrolled exception in this case;
* never mutate `strokeCount`, `strokeOrder`, or `approximateDirection` when calculating similarity.

**Dependencies**

* `CalligraphyEvaluationInterface.calculateGeneralSimilarity`
* `CalligraphyReferenceVisual`
* `CalligraphySimilarityEvaluation`

**Interface / Contracts**

Use the existing contracts:

* `CalligraphyEvaluationInterface`
* `CalligraphyEvaluationProps`

`evaluateAttempt` must internally use `calculateGeneralSimilarity` to populate `similarityEvaluation` on the returned `CalligraphyEvaluationResult`.

The View component that must consume `CalligraphyEvaluationProps` is:

* `CalligraphyEvaluationView`

The evaluation screen must reflect the updated similarity score.

---

### Feature: Visual reference-attempt comparison

**Requirements**

* Functional: R70
* Usability: R30

**Description**

Shows the user a side-by-side or overlay comparison between the reference character and their writing attempt after an evaluation.

The feature must:

* accept a `CalligraphyEvaluationResult` that contains visual data;
* reject a result without visual data by throwing with a message containing `"visual comparison"`;
* return a `CalligraphyVisualComparison` that references the same `targetCharacter` as the input result;
* expose reference and attempt as differentiated visuals;
* include homography alignment metadata when correspondences are sufficient — omit it otherwise without throwing.
* build the reference visual from the same rendered reference stroke data used for the evaluation;
* build the attempt visual from the user's actual finalized `CalligraphyAttempt.strokes`;
* calculate homography only from matched points of interest/keypoint correspondences between the rendered reference and the finalized attempt visual;
* apply homography alignment to the comparison only when there are enough valid correspondences for a stable transform, and expose whether it was applied;
* reject or show a controlled unavailable state when the real attempt visual cannot be produced.

The feature must not:

* use static placeholder assets, hard-coded character-to-file maps, `attempt://...` URIs, or the target character itself as the attempt visual;
* set homography metadata without deriving it from real matched points of interest;
* show two copies of the target character instead of the user's actual drawing and the reference;
* rely on image `alt` text as visible fallback content for the comparison.

On phone-sized screens, the comparison must remain visible and usable as a primary part of the feedback flow. The layout must not make the comparison effectively available only on large viewports. Reference and attempt visuals must have distinct accessible labels.

**Dependencies**

* `CalligraphyEvaluationInterface.createVisualComparison`
* `CalligraphyEvaluationResult`
* `CalligraphyVisualComparison`

**Interface / Contracts**

Use the existing contracts:

* `CalligraphyEvaluationInterface`
* `CalligraphyEvaluationProps`

`CalligraphyEvaluationProps` already exposes:

* `comparison?: CalligraphyVisualComparison | null`

The visual comparison must appear above the metric breakdown while the evaluation feedback is visible.

The View component that must consume `CalligraphyEvaluationProps` is:

* `CalligraphyEvaluationView`

---

### Feature: Anonymous client identifier in error reports

**Requirements**

* Functional: R71

**Description**

Attaches an anonymous client or installation identifier to generated error reports when one is available. The anonymous client identifier must be the Firebase installation ID, obtained via getInstallations from firebase/installations — never a randomly generated value, a UUID, or any other identifier not derived from the Firebase installation.

The feature must:

* include `anonymousClientId` in the generated report when `context.anonymousClientId` is present and valid;
* reject values that look like personal identifiers (e.g. contain `@`) by throwing with a message containing `"anonymous"`;
* never include `@` or any other format that suggests personal data in the identifier attached to the report;
* generate the report normally when no identifier is available.

**Dependencies**

* `ErrorObservabilityInterface.createErrorReport`
* `ApplicationErrorContext`
* `ApplicationErrorReport`
* `firebase/installations` - getInstallations   

**Interface / Contracts**

Use the existing contracts:

* `ErrorObservabilityInterface`

The `ErrorBoundary` must pass the anonymous client identifier through `context` when available.

---

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

## 4. Dependencies (explicit graph)

- Category search → depends on `CategoryInterface.searchKanjiByCategory` and `CategoryProps`.
- SIFT similarity → depends on `CalligraphyEvaluationInterface.calculateGeneralSimilarity`.
- Visual comparison → depends on SIFT similarity and `CalligraphyEvaluationInterface.createVisualComparison`.
- Anonymous client identifier → depends on `ErrorObservabilityInterface.createErrorReport` and `ApplicationErrorContext`.

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
* Every algorithm named in a feature description has a real implementation — not a score, flag, or count derived from its inputs
* Metadata about a computation reflects its actual result, not its preconditions
* Unavailable features surface an explicit unavailable state rather than a silent approximation
* SVG viewBox must be derived from actual point coordinates — never hardcoded when rendering user input
* All image URIs must be valid data URIs starting with data:image/ — SVG strings, placeholders, and invented URIs are invalid
* OpenCV.js (@techstark/opencv-js) must be used for homography computation — a boolean flag or identity matrix is not an implementation


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

* Empty search results must be handled explicitly — show an empty list, not an error
* Missing visual comparison data must be handled explicitly
* Repository failures must display clear, non-technical messages
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
