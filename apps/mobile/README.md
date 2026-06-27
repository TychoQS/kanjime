# KanjiMe Mobile

## Description

KanjiMe Mobile is the main application delivered in the Final Degree Project. It is a hybrid Japanese kanji learning application built with Ionic React, React, TypeScript, and Capacitor. The codebase combines image-based recognition, handwriting practice, offline dictionary access, local persistence, and remote observability hooks. The workspace produces a web build deployable as a Progressive Web App and native packages for Android and iOS through Capacitor.

## Features

### Classification

`Classification` implements the recognition workflow for image input and freehand drawing. The screen offers two modes through an Ionic segment: image capture/upload with crop selection, and a drawing canvas with immediate clearing and inference actions. Model inference runs off the main thread through `OcrWorkerClient` and `Features/Classification/OcrWorker.ts`, using ONNX Runtime Web inside a dedicated Web Worker.

The current worker implementation loads `/assets/model/kanji.onnx` and `/assets/model/classes.json`, preprocesses both camera/library images and canvas drawings, and reads the `kanji_logits` output to return ordered predictions. The export pipeline in `scripts/model/export-onnx.py` defines additional `radical_logits` and `stroke_logits` outputs, but the browser worker currently consumes only the kanji head.

### Calligraphy

`Calligraphy` provides handwriting practice and automated evaluation against reference stroke data. The feature contains its own controllers, contracts, services, views, and view models, including category browsing, practice screens, evaluation rendering, and a dedicated calligraphy canvas flow.

The evaluation path uses the OpenCV-based adapter under `src/Shared/opencv`. It computes SIFT descriptors, performs `BFMatcher` KNN matching with Lowe's ratio test, filters matches against ink masks, and estimates alignment with homography and `RANSAC`. The resulting metrics feed stroke-count, stroke-order, approximate-direction, and general-similarity scoring.

### Search

`Search` implements offline dictionary lookup through `KanjiRepository`. The current code supports search by kanji, by component inclusion, and by normalized reading terms. Reading normalization is handled with `wanakana`, converting the submitted term into kanji-adjacent search terms, hiragana, and katakana before querying the packaged local SQLite dictionary.

The search screen controller does not currently expose direct filtering by meaning or JLPT level.

### Kanji

`Kanji` renders the detail view for one character. It loads the full dictionary entry through `KanjiRepository.getDetails()` and displays character data, radical, components, meanings, kunyomi, onyomi, examples, stroke count, stroke order SVG, and available JLPT/Joyo levels when present.

### History

`History` persists and groups local user activity. It tracks four categories: `search`, `visitedEntry`, `imageClassification`, and `drawingClassification`. History entries are stored through `AppPersistence`, exposed in grouped form, and used to reopen kanji details without cross-feature coupling.

### Preferences

`Preferences` manages application language and theme selection. Preference state is persisted through `AppPersistence`, with native SQLite storage on Capacitor-native platforms and `localStorage` fallback in web runtimes.

### Version

`Version` checks the running application version against remote configuration data. `VersionCheckViewModel` compares the current version with `latestVersion` and `minimumSupportedVersion`, supports fallback to a last known configuration, and distinguishes between update availability and hard support thresholds.

### Error

`Error` centralizes user-facing error handling and observability reporting. `ErrorObservabilityViewModel` assembles reports containing application version, web engine, recent user actions, and an anonymous installation identifier when available. `ObservabilityPersistence` writes reports to Firestore and keeps pending reports locally when remote delivery fails.

### About

`About` exposes version, authorship, interface information, model information, text conversion, licensing details, terms, and source acknowledgments. The screen localizes values through the application i18n layer and uses repository-provided attribution data.

### Shell

`Shell` provides the mobile page wrapper, navigation, loading screen, and routing-level composition. The feature acts as the structural shell for the rest of the application and coordinates screen-level enablement.

## Architecture

The mobile workspace follows a feature-oriented structure rooted in `apps/mobile/src`.

### Composition Root

`CompositionRoot.ts` is the central dependency injection entry point. It instantiates repositories, persistence adapters, OCR runtime access, OpenCV services, Firebase clients, error reporting controllers, navigation handlers, and feature controllers. It also wires E2E behavior through `src/Shared/E2EMocks.ts`, allowing browser-level tests to replace remote dependencies with deterministic local behavior.

### Features

Each directory under `src/Features` is a self-contained module composed of controllers, contracts, views, and view models. Business logic resides in feature controllers and view models, while the rendered views remain thin Ionic/React presentation components. Navigation between features is coordinated through shared services and composition-level delegates rather than direct feature-to-feature imports.

### Shared Infrastructure

The `src/Shared` directory contains the transversal infrastructure used by multiple features:

- `KanjiRepository.ts` provides read-only access to the packaged SQLite dictionary and its attributions.
- `OcrWorkerClient.ts` is the browser-side client for the ONNX inference worker.
- `OpenCvService.ts` and `src/Shared/opencv/*` wrap the custom OpenCV.js runtime used by calligraphy evaluation.
- `FirebaseClient.ts` exposes the Firebase application and Firestore client used by observability-related flows.
- `FirebaseInstallationClient.ts` reads the anonymous installation identifier used in reports.
- `AppPersistence.ts` stores preferences and history with native SQLite on Capacitor platforms and `localStorage` fallback on the web.
- `ObservabilityPersistence.ts` stores pending error reports and version configuration, and synchronizes with Firestore.
- `I18n.ts` defines `SUPPORTED_LOCALES`, translation keys, and translation maps for the multilingual interface.
- `Database/PackagedDatabase.ts` copies the bundled SQLite asset to native storage when needed and opens it with sql.js.
- `UserActionTracker.ts` records recent actions that can later be attached to error reports.

## Technology Stack

| Technology | Version | Source |
| --- | --- | --- |
| Ionic React | `^8.8.4` | `@ionic/react`, `@ionic/react-router` |
| React | `^18.3.1` | `react`, `react-dom` |
| Capacitor | `^7.6.1` / `^7.1.2` / `^7.0.4` / `^7.1.8` / `^7.0.5` | `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/app`, `@capacitor/preferences`, `@capacitor/filesystem`, `@capacitor/device`, `@capacitor/clipboard` |
| TypeScript | `^6.0.2` | `typescript` |
| ONNX Runtime Web | `^1.24.3` | `onnxruntime-web` |
| OpenCV.js | Custom build (NON_FREE=YES, SIFT enabled) | Custom vendored build under `scripts/opencv-build/` |
| sql.js | `^1.14.1` | `sql.js` |
| Firebase / Firestore | `^12.13.0` | `firebase` |
| wanakana | `^5.3.1` | `wanakana` |
| Vite | `^8.0.8` | `vite` |
| Vitest | `^4.1.4` | `vitest`, `@vitest/coverage-v8` |
| Playwright | `^1.55.1` | `@playwright/test` |

## Data Sources

| Source | Role in the mobile application |
| --- | --- |
| JMdict | Source for example and reading-related dictionary data transformed into the packaged SQLite database. |
| KANJIDIC2 | Source for kanji metadata such as readings, meanings, levels, radicals, and stroke counts. |
| KanjiVG | Source for stroke order SVG data and structural components. |
| Tanos JLPT | Source for JLPT classification labels used during database generation. |
| ETL9B | Source dataset used to train the recognition model before ONNX export. |

The original datasets are not redistributed directly. Instead, the workspace downloads and transforms them through the project-specific data pipeline exposed by:

```bash
npm run data:prepare
```

## Supported Platforms

- Android through Capacitor and the generated native project under `/android`
- iOS through Capacitor
- Progressive Web App (PWA) via Web App Manifest (`public/manifest.webmanifest`)

## Installation and Development

All commands in this section are intended to be run from this directory (`apps/mobile/`).

Before running this workspace, install the monorepo dependencies and generate the packaged database from the repository root:

```bash
npm install
npm run data:prepare
```

### Development Server

```bash
npm run dev
```

### Web Build

```bash
npm run build
```

### Capacitor Android Sync and Android Studio Launch

This workspace exposes `build:android` as the available Android sync workflow. It builds the app, runs `npx cap sync android`, and opens Android Studio.

`build:android` performs the following steps in order:

1. Builds the web application (`npm run build`)
2. Synchronises the output with the Android native project (`npx cap sync android`)
3. Opens Android Studio (`npx cap open android`)

Android Studio must be installed at `~/Descargas/android-studio/bin/studio.sh`, or the `CAPACITOR_ANDROID_STUDIO_PATH` environment variable must be updated with the correct path before running this command.

```bash
npm run build:android
```

### Unit Tests

```bash
npm run test:unit
```

### Test Coverage

```bash
npm run test:coverage
```

### End-to-End Tests

```bash
npm run test:e2e
```

## Testing

The mobile workspace uses a two-layer testing strategy.

- Unit and integration tests run with Vitest against controllers and services. Factory functions such as `CreateCanvasController.ts`, `CreateSearchController.ts`, and similar feature-level constructors allow dependencies to be injected directly at controller creation time.
- End-to-end tests run with Playwright against the built browser application. E2E-specific behavior is injected through `CompositionRoot.ts` and `src/Shared/E2EMocks.ts`, where `VITE_ENABLE_E2E_MOCKS=true` activates local substitutes for version configuration and error-report flows.
