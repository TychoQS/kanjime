# Iteration 2 — Context

## 1. Purpose

This iteration implements the Calligraphy module, oriented towards active practice and evaluation of handwritten Japanese kanji. It is divided into one main functionality: kanji practice selection (organised by JLPT and Jōyō groupings).

Additionally, the Navigation feature must be updated to include the new calligraphy screen.

---

## 2. Feature order (MANDATORY)

1. Navigation (update)
2. Calligraphy feature

---

## 3. Features

### Feature: Navigation (update)

**Requirements**
- Functional: R27, R28

**Description**
Update the navigation type union to include `"calligraphy"` and wire the new screen into the application routing and menu.

**Dependencies**
- None

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

### Feature: Calligraphy

**Requirements**
- Functional: R42-R48
- Usability: R17-R18

**Description**
Allows the user to toggle between JLPT level or Joyo category, and then on the same screen allows to select a group of them. Once selected the group a list of kanjis for this group is displayed and the user can start a practice session of a single kanji of the group. After the evaluation, the user can navigate back to the kanji list of that category, and to the screen where the user selected de category.

**Dependencies**
- Kanji data
- Navigation

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Kanji Practice

**Requirements**
- Functional: R50-R53
- Usability: R19-R21,R23

**Description**
Allow the user to make practice session for a specific kanji drawing on a canvas. Allows the user to finish the practice and request evaluation. Allows navigating back to the category kanji list or clearing the canvas. Information about the current kanji is not displayed during practice, only at the end after evaluation.

**Dependencies**
- Calligraphy

**Interface / Contracts**

(For the conditions go to the `.requirements` directory — KanjiPracticeInterface)

---

### Feature: Calligraphy Evaluation

**Requirements**
- Functional: R54-R56
- Usability: R22

**Description**
Evaluates the writing attempt considering stroke count, order, approximate direction, and overall similarity. Calculates a global accuracy score within the permitted range. Displays visual feedback with the score and a result summary overlaid on the practice screen.

**Dependencies**
- Kanji Practice
- Calligraphy
- Kanji data

**Interface / Contracts**

(For the conditions go to the `.requirements` directory — CalligraphyEvaluationInterface, CalligraphyEvaluationProps)

---

## 4. Dependencies (explicit graph)

- Navigation → no dependencies
- Calligraphy → depends on Kanji data and Navigation
- Kanji Practice → depends on Calligraphy
- Calligraphy Evaluation → depends on Kanji Practice, Kanji data and Calligraphy

---

## 5. Integration rules

- A feature is only valid if it is reachable from the application
- Features must be integrated into App, routing, or main flow
- No orphan features are allowed
- UI must reflect real application state
- A feature is INVALID if it passes tests but is not visible or usable in the UI
- Proposed code for the feature is only valid if it uses the components that are being tested within the tests for the iteration. Do not generate an implementation that is not being tested.

---

## 6. Definition of Done

A feature is complete only if:

- Tests pass
- No regressions exist
- Contracts are respected
- Dependencies are implemented and used
- Feature is integrated into the application
- Feature is reachable from UI or main flow
- No final stubs remain
- No hardcoded or test-specific logic exists
- Real implementation. Not just a mock implementation to pass tets and other implementation for the application. The implementation must use the current contracts and their current implementations.

---

## 7. UI validation rules

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
- Errors must display clear, non-technical messages
- UI must not break when data is missing or undefined

### Invalid UI conditions

The UI is invalid if:

- Elements are not clickable due to layout issues
- Components are duplicated unintentionally
- UI does not update after state changes
- UI shows stale or inconsistent data
- UI depends on hardcoded values

---

## 8. Data access rules

- All data must come from real sources (no hardcoded or mock data)
- Static assets in `/public` must be accessed via HTTP (`fetch`)
- Database files must not be imported directly into code
- SQLite requires a runtime reader (e.g. WASM or adapter)
- Bypassing the data layer is forbidden

---

## 9. Architecture validation

After each feature, verify:

```bash
# No screen receives CompositionRoot directly
grep -rn "CompositionRoot" src/Features/ --include="*.tsx"

# No screen accesses data directly
grep -rn "root\." src/Features/ --include="*.tsx"
```

Both commands must return no matches for the feature to be valid.

---

## 10. Global constraints

- Requirements in `.requirements` are the source of truth
- Architecture rules are defined in `AGENTS.md`
- This file only defines execution order and constraints
- Do not hardcode outputs
- Do not create mocks or final stubs
- Exceptions must follow contract rules