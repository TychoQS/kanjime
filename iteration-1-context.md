# Iteration 1 — Context

## 1. Purpose

This iteration implements the core OCR workflow of the application, including input (drawing and image), inference execution, result display, searchs of the kanjis, the entries of the kanjis, a history of the entries that the user has consulted, and navigation between main features.

---

## 2. Feature order (MANDATORY)

1. Model
2. Inference
3. Canvas
4. Image
5. Display (Inference + Kanji)
6. Classification
7. Search
8. History
9. Navigation
10. User Preferences

---

## 3. Features

### Feature: Model

**Requirements**
- Functional: -
- Performance: R1
- Usability: -

**Description**
Loads and prepares the ONNX model for inference. Ensuring the model is loaded only once.

**Dependencies**
- None

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Inference

**Requirements**
- Functional: R22–R26
- Performance: R2
- Usability: R4

**Description**
Executes classification of input data and returns ordered predictions. Ensures that the input image is properly preprocessed to be consumed by the classification model, using the Milyaev binarization method (for images) and black background with white lines (for canvas).

**Dependencies**
- Model

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Canvas

**Requirements**
- Functional: R3–R7
- Performance: -
- Usability: R1

**Description**
Allows the user to freely draw strokes using the touch screen of the mobile device and trigger inference.

**Dependencies**
- Inference

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

**Notes**
Must not perform inference without valid strokes.

---

### Feature: Image

**Requirements**
- Functional: R19–R21
- Performance: -
- Usability: R13, R16

**Description**
Handles image taking with camera and image loading from the user's device gallery, displays the image, and manages the image in the display component before inference.

**Dependencies**
- Inference

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Classification

**Requirements**
- Functional: R36, R39
- Performance: -
- Usability: -

**Description**
Manages switching between drawing and image classification modes.

**Dependencies**
- Canvas
- Image
- Inference
- Display (Inference + Kanji)

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Display (Inference + Kanji)

**Requirements**
- Functional: R8–R14
- Performance: -
- Usability: R4, R5, R6

**Description**
Displays inference results and Kanji details.

**Dependencies**
- Inference
- Kanji data

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Search

**Requirements**
- Functional: R31–R35
- Performance: R3
- Usability: R11, R12

**Description**
Allows searching Kanji by input and displaying results.

**Dependencies**
- Kanji data

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: History

**Requirements**
- Functional: R15–R18
- Performance: -
- Usability: R2, R3

**Description**
Stores and displays user interaction history.

**Dependencies**
- Display (Inference + Kanji)

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: Navigation

**Requirements**
- Functional: R27, R28
- Performance: -
- Usability: R8, R9

**Description**
Controls navigation between application screens and have the preference to control the language and theme of the application.
There are 4 screens:
- Classification (includes two submodes: Canvas, Image and Display)
- History
- Search
- About

**Dependencies**
- All UI features
- i18n for l18n support

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

### Feature: About / User Preferences

**Requirements**
- Functional: R1, R2, R37, R38
- Performance: -
- Usability: R10, R15

**Description**
Displays application information and manages user preferences.

**Dependencies**
- Navigation

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

---

## 4. Dependencies (explicit graph)

- Model → no dependencies
- Inference → depends on Model
- Canvas → depends on Inference
- Image → depends on Inference
- Classification → depends on Canvas, Image, Inference
  (controls active input source and triggers inference flow)
- Display → depends on Inference, Kanji data
  (renders predictions and kanji information)
- Search → depends on Kanji data
- History → depends on Display, Search
  (entries originate from viewed results and searches)
- Navigation → depends on Classification, Search, History, About
  (orchestrates access to application features)
- About / User → depends on Navigation

---

## 5. Integration rules

- A feature is only valid if it is reachable from the application
- Features must be integrated into App, routing, or main flow
- No orphan features are allowed
- UI must reflect real application state
- A feature is INVALID if it passes tests but is not visible or usable in the UI

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

## 9. Global constraints

- Requirements in `.requirements` are the source of truth
- Architecture rules are defined in `AGENTS.md`
- This file only defines execution order and constraints
- Do not hardcode outputs
- Do not create mocks or final stubs
- Exceptions must follow contract rules