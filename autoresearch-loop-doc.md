# autoresearch-loop

## What this file is

This skill defines the mechanics of the TDD implementation loop for this project.  
It is permanent and does not change between iterations. What changes between  
iterations is the domain context file referenced below in Component 1.

Before starting, read in this order:

1. `AGENTS.md` — architecture, design decisions and project conventions  
2. The highest `iteration-N-context.md`  
3. This file — the loop mechanics  

---

## The four components of the loop

### Component 1 — The modifiable code

The code you can modify lives in `src/`. Your work concentrates on these types of action:

- Creating new implementation files (viewmodels, hooks, views, components, services, repositories)
- Updating only the return statement of existing factory functions so they delegate to those new files (see Component 2)
- Integrating features into the application (App, routing, composition root, etc.)

The domain context file for the current iteration tells you which features exist, in what order to implement them, and which business rules each one must respect.

If a file named `iteration-N-context.md` exists with a higher N, that one takes precedence.

What you must never touch, inside or outside `src/`:

- The `tests/` folder — do not open, read, or modify
- Contracts (`Contracts/`, `Interface`, `Props`, `Contract`, `Types`)
- Factory signatures (only change their return)
- Dependency interfaces (`CreateXxxDependencies`)
- Anything outside `src/`

Strict rules:

- All behavior must be implemented through real logic and real data flow  
- Simulating expected test outputs is forbidden  
- A feature is NOT complete unless it is reachable from the running application  
- Orphan features (implemented but unused) are invalid  

---

### Component 2 — The instructions

The implementation pattern you must follow for every feature is always the same.

Factory functions may contain stubs, but you must NOT implement logic inside them.

Example stub:

```typescript
export function CreateCanvasController(
  _dependencies: CreateCanvasControllerDependencies
): CanvasInterface {
  return {
    async registerStroke(_stroke) { return []; },
    clearCanvas() {},
    getStrokeHistory() { return []; }
  };
}
```

You must NOT complete this object.

Instead:

1. Create real implementation files  
2. Move logic into those files  
3. Delegate from the factory  

Example:

```typescript
import { createCanvasViewModel } from "../ViewModel/CanvasViewModel";

export function CreateCanvasController(
  dependencies: CreateCanvasControllerDependencies
): CanvasInterface {
  return createCanvasViewModel(dependencies);
}
```

All logic must live outside factories.

Additionally:

- Implement or wire required dependencies  
- Ensure dependencies are actually used (not bypassed)  
- Integrate the feature into the application (App, routing, composition root, database, preferences, inference, etc.)  
- Ensure the feature is reachable from the UI or main flow  

A valid implementation must include:

- real logic  
- real data flow  
- correct dependency usage  
- integration into the running application  

Each feature follows this structure:

```
src/features/Canvas/
  Contracts/
    CanvasInterface.ts
  Controller/
    CreateCanvasController.ts
  ViewModel/
    CanvasViewModel.ts
    useCanvas.ts
  View/
    CanvasView.tsx
```

You can explore the whole project and read any file or use it in the code but you must:
- Not modify anything outside `src/`.
- Not modify contracts, 
- Not read the `tests/` folder. 

---

### Component 3 — The evaluation metric

Tests passing is necessary but not sufficient.

A solution is valid only if BOTH validation layers pass.

---

#### Layer 1 — Automated validation

Run:

```bash
npm run test
```

This layer passes only if:

- All tests pass  
- No previously passing tests become failing  

---

#### Layer 2 — Structural validation checklist

After tests pass, run:

```bash
git diff -- src
```

Then verify ALL of the following:

- [ ] The diff contains real implementation (not trivial changes)
- [ ] No logic inside factory return objects
- [ ] Factories only delegate
- [ ] No mocks, fakes, stubs, or hardcoded outputs in `src/`
- [ ] No test-specific logic
- [ ] Dependencies are implemented or wired
- [ ] Dependencies are actually used
- [ ] Feature is integrated into the application
- [ ] Feature is reachable from UI or main flow
- [ ] No orphan features exist

#### Exception handling rules

- Exceptions are allowed only if required by the contract (`@pre`, `@inv`, `@post`)
- Throwing errors to satisfy tests without respecting contracts is forbidden
- All thrown errors must be justified by domain logic
- Error messages should reflect the domain meaning of the failure

Run automated checks:

```bash
grep -R "vi.mock\|jest.mock\|mockReturnValue\|mockResolvedValue\|hardcoded\|TODO" src
grep -R "vitest\|jest\|from .*test\|from .*tests\|__mocks__\|fixtures" src
grep -R "return \[\]\|return {}\|return null\|return undefined" src
```

If matches exist, they MUST be justified by the contract.  
If they cannot be justified → experiment fails.

---

A solution is valid only if:

- Layer 1 passes  
- Layer 2 checklist passes  

---

### Component 4 — The budget per experiment

Each experiment covers exactly one feature.

Before starting:

- Run `npm run test`
- Record baseline (green vs red tests)
- Create checkpoint:

```bash
git diff > .autoresearch-checkpoint.patch
```

During the experiment:

- Implement one feature fully (logic + dependencies + integration)

After implementation:

- Run `npm run test`
- Compare with baseline

The experiment succeeds only if:

- Feature tests pass  
- No regressions exist  
- Evaluation metric (Component 3) passes  

If the experiment fails:

```bash
git checkout -- src
git apply .autoresearch-checkpoint.patch
```

Then retry with a different strategy.

Do NOT commit. The user handles commits.

---

## The loop — run without stopping until complete

The loop does not end until:

- all tests are green  
- AND the implementation is valid  

---

### LOOP STEPS

1. **BASELINE**
   - Run `npm run test`
   - Record failing and passing tests
   - If all tests pass:
     - Run structural validation (Component 3)
     - If valid → END
     - If invalid → continue

2. **SELECT FEATURE**
   - Identify feature from failing tests or invalid implementation
   - Choose exactly ONE feature

3. **CHECKPOINT**

```bash
git diff > .autoresearch-checkpoint.patch
```

4. **IMPLEMENT FEATURE**
   - Read contract and factory
   - Create implementation files
   - Implement real logic
   - Implement or wire dependencies
   - Integrate feature into application
   - Update factory return (delegate only)

5. **TEST**
   - Run `npm run test`

6. **HANDLE TEST FAILURES**
   - If failures belong to current feature:
     - Fix and re-test → go back to step 5
   - If regressions appear:

```bash
git checkout -- src
git apply .autoresearch-checkpoint.patch
```

   - Go back to step 2

7. **VALIDATE IMPLEMENTATION**
   - Run Component 3 validation

   - If validation fails:

```bash
git checkout -- src
git apply .autoresearch-checkpoint.patch
```

   - Go back to step 2

   - If validation passes:
     - Keep changes
     - Delete checkpoint
     - Go back to step 1

8. **REPEAT**
   - Continue until completion

---

END — only when tests pass AND validation passes

Do not:

- Stop between experiments  
- Ask for confirmation  
- Ask questions  

If unsure about architecture → read `AGENTS.md`  
If unsure about features → read `iteration-N-context.md` or `.requirements/*`

---

## Code constraints

- No `any`  
- No `console.log` in production  
- No mocks in production code  
- No fake implementations  
- No final stubs  
- No hardcoded test outputs  
- No test imports  
- TSDoc on public interfaces with `@pre`, `@inv`, `@post`  
- Follow `AGENTS.md`