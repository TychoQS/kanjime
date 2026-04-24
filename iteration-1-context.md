# Iteration 1 — Context

## 1. Purpose

Describe briefly what this iteration achieves.


---

## 2. Feature order (MANDATORY)

Define a strict execution order. No feature should be independent unless truly standalone.

---

## 3. Features

### Feature: [Name]

**Requirements**
- Functional: R?
- Performance: R?
- Usability: R?

**Description**
What this feature does.

**Dependencies**
- [Other features]

**Interface / Contracts**

(For the conditions go to the `requirements.md` file)

**Notes (optional)**
Clarifications to avoid bad implementations.

---

(repeat for each feature)

---

## 4. Dependencies (explicit graph)

Define real dependencies between features.

- Feature X → depends on Feature Y

---

## 5. Integration rules

- A feature is only valid if it is reachable from the application
- Features must be integrated into App, routing, or main flow
- No orphan features are allowed
- UI must reflect real application state

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

### Data / State


### Error / Edge cases

### Invalid UI conditions


---

## 8. Global constraints

- Requirements in `.requirements` are the source of truth
- Architecture rules are defined in `AGENTS.md`
- This file only defines execution order and constraints
- Do not hardcode outputs
- Do not create mocks or final stubs
- Exceptions must follow contract rules