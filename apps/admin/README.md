# KanjiMe Admin

## Description

KanjiMe Admin is the web administration panel for the KanjiMe project. It provides the technical support interface used to inspect recognition error reports submitted by the mobile application and to manage the remote version configuration consumed by the mobile client. Administrator access is protected through Google Sign-In implemented with Firebase Auth.

## Features

- Review error reports stored in Firestore through the `errors` collection, including application version, occurrence timestamp, web engine information, and recent user actions when available.
- Filter reports by status and update their lifecycle state across `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, and `DISCARDED`.
- Manage the current remote version configuration stored in Firestore under the `versionConfiguration/current` document, including current version, latest version, minimum supported version, and update timestamp.
- Authenticate administrators through Google Sign-In backed by Firebase Auth.
- Subscribe to near real-time Firestore updates for the reported error list and dashboard summary.

## Technology Stack

| Technology | Version | Source |
| --- | --- | --- |
| React | `^18.3.1` | `react`, `react-dom` |
| Ionic React | `^8.8.4` | `@ionic/react` |
| Vite | `^8.0.8` | `vite` |
| TypeScript | `^6.0.2` | `typescript` |
| Firebase Auth | `^12.13.0` | `firebase` |
| Firestore | `^12.13.0` | `firebase` |
| Vitest | `^4.1.4` | `vitest`, `@vitest/coverage-v8` |
| Playwright | `^1.55.1` | `@playwright/test` |

## Installation and Development

All commands in this section are intended to be run from this directory (`apps/admin/`).

Install monorepo dependencies from the repository root before working with this workspace:

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Unit Tests

```bash
npm run test:unit
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Testing

The administration panel uses the same testing split as the rest of the monorepo.

- Unit and integration tests run with Vitest against controller-level logic and feature behavior. The controller-based composition exposed through `createAdminCompositionRoot()` and the feature controller factories supports inline dependency injection for test doubles.
- End-to-end tests run with Playwright against the built application preview served on port `4174`.
- The codebase includes E2E-specific infrastructure through `src/Shared/E2EMocks.ts`, activated with `VITE_ENABLE_E2E_MOCKS=true` during Playwright runs.

## Firebase Configuration

The workspace reads Firebase client configuration from `apps/admin/.env` through `import.meta.env` in `src/Shared/FirebaseClient.ts`.

Required variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Related files:

- `apps/admin/.env`
- `apps/admin/src/Shared/FirebaseClient.ts`
- `apps/admin/src/Shared/AdminObservabilityRepository.ts`

This README documents the required variable names and file locations only. Literal environment values are intentionally not duplicated here.
