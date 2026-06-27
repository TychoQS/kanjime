# KanjiMe

## Project Description

KanjiMe is a hybrid application for learning Japanese kanji, developed as an academic Final Degree Project (TFG). The repository is organized as an npm workspaces monorepo and contains the mobile application, the administration panel, shared TypeScript packages, and the native Android project generated through Capacitor.

### Academic Context

This project is part of my Final Degree Project (TFG) for the Degree in Computer Science at the ULPGC.

Project name: KanjiMe

Author: Tycho Quintana Santana

## Repository Structure

This repository is an npm workspaces monorepo declared in the root `package.json`.

| Path | Description |
| --- | --- |
| `apps/mobile` | Hybrid Ionic React + Capacitor application intended for the end user experience. |
| `apps/admin` | Web administration panel used to review recognition error reports and manage remote version configuration. |
| `packages/shared` | Shared TypeScript package consumed by both applications. |
| `android` | Native Android project generated for the mobile app through Capacitor. |

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React `^18.3.1`, Ionic React `^8.8.4` |
| Testing | Vitest `^4.1.4`, Playwright `^1.55.1`, Testing Library |
| Build Tooling | Vite `^8.0.8`, TypeScript `^6.0.2`, npm workspaces |
| Mobile Runtime | Capacitor core/android/ios `^7.6.1`, `@capacitor-community/sqlite` `^7.0.2` |
| Data and Inference | ONNX Runtime Web `^1.24.3`, sql.js `^1.14.1`, wanakana `^5.3.1` |
| Backend / Cloud | Firebase `^12.13.0`, Firestore, Firebase Auth |

## Prerequisites
- Node.js 22.x (LTS)
- npm 10.x
- Android Studio (for Android builds)
- JDK 21 (required by Gradle)

## Installation

1. Clone the repository, including the configured Git submodule used for the OpenCV.js build pipeline:

```bash
git clone --recurse-submodules <repository-url>
cd kanjime
```

2. Install dependencies for every workspace from the monorepo root:

```bash
npm install
```

3. Generate the local packaged database before running the applications.

#### Database Generation

Since the processed database is not included in this repository, it must be generated locally before running the application. To download the necessary sources and build the packaged SQLite database, execute the following command:

```bash
npm run data:prepare
```

## Monorepo Commands

### Development

| Workspace | Command | Purpose |
| --- | --- | --- |
| `@kanjime/mobile` | `npm run dev -w @kanjime/mobile` | Start the mobile web development server on port `5173`. |
| `@kanjime/admin` | `npm run dev -w @kanjime/admin` | Start the administration panel development server on port `5174`. |
| `@kanjime/shared` | `npm run dev -w @kanjime/shared` | Start the shared package TypeScript watch build. |

### Build

| Workspace | Command | Purpose |
| --- | --- | --- |
| `@kanjime/shared` | `npm run build -w @kanjime/shared` | Build the shared package. |
| `@kanjime/mobile` | `npm run build -w @kanjime/mobile` | Build the mobile workspace after rebuilding the shared package. |
| `@kanjime/mobile` | `npm run build:app -w @kanjime/mobile` | Build the mobile web application only. |
| `@kanjime/mobile` | `npm run build:opencv -w @kanjime/mobile` | Build the vendored OpenCV.js runtime used by calligraphy evaluation. |
| `@kanjime/mobile` | `npm run build:android -w @kanjime/mobile` | Build the mobile app, sync Capacitor Android, and open Android Studio. The script performs these steps in order: 1. build the web application with `npm run build`, 2. synchronise the output with the Android native project using `npx cap sync android`, and 3. open Android Studio with `npx cap open android`. Android Studio must be installed at `~/Descargas/android-studio/bin/studio.sh`, or `CAPACITOR_ANDROID_STUDIO_PATH` must be updated with the correct path before running the command. |
| `@kanjime/admin` | `npm run build -w @kanjime/admin` | Build the administration workspace after rebuilding the shared package. |
| `@kanjime/admin` | `npm run build:app -w @kanjime/admin` | Build the administration web application only. |

### Unit and Integration Testing

| Workspace | Command | Purpose |
| --- | --- | --- |
| `@kanjime/mobile` | `npm run test -w @kanjime/mobile` | Run the default mobile Vitest suite after rebuilding shared code. |
| `@kanjime/mobile` | `npm run test:unit -w @kanjime/mobile` | Run mobile unit tests. |
| `@kanjime/mobile` | `npm run test:integration -w @kanjime/mobile` | Run mobile integration tests. |
| `@kanjime/mobile` | `npm run test:integration:live -w @kanjime/mobile` | Run the mobile live Firebase integration test subset. |
| `@kanjime/admin` | `npm run test -w @kanjime/admin` | Run the default admin Vitest suite after rebuilding shared code. |
| `@kanjime/admin` | `npm run test:unit -w @kanjime/admin` | Run admin unit tests. |
| `@kanjime/admin` | `npm run test:integration -w @kanjime/admin` | Run admin integration tests. |
| `@kanjime/admin` | `npm run test:integration:live -w @kanjime/admin` | Run the admin live Firebase integration test subset. |

### End-to-End Testing

| Workspace | Command | Purpose |
| --- | --- | --- |
| `@kanjime/mobile` | `npm run test:e2e -w @kanjime/mobile` | Build the mobile app with E2E mocks and run Playwright. |
| `@kanjime/admin` | `npm run test:e2e -w @kanjime/admin` | Build the admin app with E2E mocks and run Playwright. |

### Linting

| Workspace | Command | Purpose |
| --- | --- | --- |
| `@kanjime/shared` | `npm run lint -w @kanjime/shared` | Lint the shared package. |
| `@kanjime/mobile` | `npm run lint -w @kanjime/mobile` | Lint the mobile application. |
| `@kanjime/admin` | `npm run lint -w @kanjime/admin` | Lint the administration panel. |

## Tests

The monorepo uses Vitest for unit and integration coverage in both applications and Playwright for browser-level end-to-end testing.

### Unit and Integration Suites

```bash
npm run test:unit -w @kanjime/mobile
npm run test:integration -w @kanjime/mobile
npm run test:unit -w @kanjime/admin
npm run test:integration -w @kanjime/admin
```

### End-to-End Suites

```bash
npm run test:e2e -w @kanjime/mobile
npm run test:e2e -w @kanjime/admin
```

## Data Attribution

This project packages locally processed and transformed data derived from the following sources:

- JMdict, provided by the Electronic Dictionary Research and Development Group (EDRDG): https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
- KANJIDIC2, provided by the Electronic Dictionary Research and Development Group (EDRDG): https://www.edrdg.org/wiki/index.php/KANJIDIC_Project
- KanjiVG, provided by the KanjiVG project contributors: https://kanjivg.tagaini.net/
- Tanos JLPT Kanji Lists, provided by Jonathan Waller (Tanos): https://www.tanos.co.uk/jlpt/skills/kanji/

The application does not redistribute the original source datasets directly.
Instead, custom scripts are used to process and transform the original data into application-specific formats.

The recognition model used by this project was trained using ETL9B, part of the ETL Character Database, provided by the National Institute of Advanced Industrial Science and Technology (AIST), Japan:
https://etlcdb.db.aist.go.jp/?lang=en

The original datasets remain subject to their respective licenses and attribution requirements.

#### Database Generation

Since the processed database is not included in this repository, it must be generated locally before running the application. To download the necessary sources and build the packaged SQLite database, execute the following command:

```bash
npm run data:prepare
```

## Copyright

All rights reserved unless otherwise stated.
