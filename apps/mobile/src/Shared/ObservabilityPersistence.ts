import { Preferences } from "@capacitor/preferences";
import { collection, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";

import type {
  ApplicationErrorReport,
  ApplicationUserAction,
  ObservabilityRepository,
  VersionConfiguration
} from "@kanjime/shared";
import {
  isMobileE2EMocksEnabled,
  readMobileE2EErrorReports,
  readMobileE2ELastKnownVersionConfiguration,
  readMobileE2ERemoteVersionConfiguration,
  writeMobileE2EErrorReports,
  writeMobileE2ELastKnownVersionConfiguration
} from "./E2EMocks";
import { getFirebaseFirestore } from "./FirebaseClient";

const ERROR_REPORTS_KEY = "kanjime.observability.errorReports";
const PENDING_ERROR_REPORTS_KEY = "kanjime.observability.pendingErrorReports";
const VERSION_CONFIGURATION_KEY = "kanjime.observability.versionConfiguration";
const ERRORS_COLLECTION = "errors";
const VERSION_CONFIGURATION_COLLECTION = "versionConfiguration";
const CURRENT_VERSION_CONFIGURATION_DOCUMENT = "current";

/**
 * Mobile observability repository backed by Firestore with local fallback storage.
 */
export class ObservabilityPersistence implements ObservabilityRepository {
  async saveErrorReport(report: ApplicationErrorReport): Promise<void> {
    if (isMobileE2EMocksEnabled()) {
      const nextReports = [
        ...readMobileE2EErrorReports().filter(candidate => candidate.id !== report.id),
        report
      ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
      writeMobileE2EErrorReports(nextReports);
      return;
    }

    try {
      await setDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, report.id), report);
      await removePendingErrorReport(report.id);
    } catch {
      await savePendingErrorReport(report);
    }
  }

  async flushPendingErrorReports(): Promise<void> {
    if (isMobileE2EMocksEnabled()) {
      return;
    }

    const pendingReports = await readPendingErrorReports();

    for (const report of pendingReports) {
      try {
        await setDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, report.id), report);
        await removePendingErrorReport(report.id);
      } catch {
        return;
      }
    }
  }

  async listErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>> {
    if (isMobileE2EMocksEnabled()) {
      return readMobileE2EErrorReports();
    }

    try {
      const snapshot = await getDocs(query(collection(getFirebaseFirestore(), ERRORS_COLLECTION)));
      return snapshot.docs
        .map(documentSnapshot => parseErrorReport(documentSnapshot.data()))
        .filter((report): report is ApplicationErrorReport => report !== null)
        .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
    } catch {
      return readPendingErrorReports();
    }
  }

  async getErrorReport(id: string): Promise<ApplicationErrorReport | null> {
    if (isMobileE2EMocksEnabled()) {
      return readMobileE2EErrorReports().find(report => report.id === id) ?? null;
    }

    try {
      const snapshot = await getDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, id));
      return snapshot.exists() ? parseErrorReport(snapshot.data()) : null;
    } catch {
      const reports = await readPendingErrorReports();
      return reports.find(report => report.id === id) ?? null;
    }
  }

  async saveVersionConfiguration(config: VersionConfiguration): Promise<void> {
    if (isMobileE2EMocksEnabled()) {
      writeMobileE2ELastKnownVersionConfiguration(config);
      return;
    }

    await Preferences.set({
      key: VERSION_CONFIGURATION_KEY,
      value: JSON.stringify(config)
    });
  }

  async getVersionConfiguration(): Promise<VersionConfiguration | null> {
    if (isMobileE2EMocksEnabled()) {
      return readMobileE2ERemoteVersionConfiguration();
    }

    const snapshot = await getDoc(
      doc(
        getFirebaseFirestore(),
        VERSION_CONFIGURATION_COLLECTION,
        CURRENT_VERSION_CONFIGURATION_DOCUMENT
      )
    );

    if (!snapshot.exists()) {
      return null;
    }

    return parseVersionConfigurationSnapshot(snapshot.data());
  }

  async getLastKnownVersionConfiguration(): Promise<VersionConfiguration | null> {
    if (isMobileE2EMocksEnabled()) {
      return readMobileE2ELastKnownVersionConfiguration();
    }

    try {
      const result = await Preferences.get({ key: VERSION_CONFIGURATION_KEY });
      return parseVersionConfigurationString(result.value);
    } catch {
      return null;
    }
  }
}

async function savePendingErrorReport(report: ApplicationErrorReport): Promise<void> {
  const reports = await readPendingErrorReports();
  const nextReports = [
    ...reports.filter(candidate => candidate.id !== report.id),
    report
  ];

  await Preferences.set({
    key: PENDING_ERROR_REPORTS_KEY,
    value: JSON.stringify(nextReports)
  });

  await Preferences.set({
    key: ERROR_REPORTS_KEY,
    value: JSON.stringify(nextReports)
  });
}

async function removePendingErrorReport(reportId: string): Promise<void> {
  const nextReports = (await readPendingErrorReports()).filter(report => report.id !== reportId);

  await Preferences.set({
    key: PENDING_ERROR_REPORTS_KEY,
    value: JSON.stringify(nextReports)
  });

  await Preferences.set({
    key: ERROR_REPORTS_KEY,
    value: JSON.stringify(nextReports)
  });
}

async function readPendingErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>> {
  try {
    const result = await Preferences.get({ key: PENDING_ERROR_REPORTS_KEY });
    const reports = parseErrorReports(result.value);

    if (reports.length > 0) {
      return reports;
    }

    const legacyResult = await Preferences.get({ key: ERROR_REPORTS_KEY });
    return parseErrorReports(legacyResult.value);
  } catch {
    return [];
  }
}

function parseErrorReports(value: string | null): ReadonlyArray<ApplicationErrorReport> {
  if (value === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(item => parseErrorReport(item))
      .filter((report): report is ApplicationErrorReport => report !== null);
  } catch {
    return [];
  }
}

function parseErrorReport(value: unknown): ApplicationErrorReport | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const message = value.message;
  const occurredAt = value.occurredAt;
  const applicationVersion = value.applicationVersion;
  const webEngine = value.webEngine;
  const webEngineVersion = value.webEngineVersion;
  const isReadyForObservability = value.isReadyForObservability;
  const lastActions = Array.isArray(value.lastActions)
    ? value.lastActions.filter(isApplicationUserAction)
    : [];

  if (
    typeof id !== "string" ||
    typeof message !== "string" ||
    typeof occurredAt !== "string" ||
    typeof applicationVersion !== "string" ||
    typeof webEngine !== "string" ||
    typeof webEngineVersion !== "string" ||
    typeof isReadyForObservability !== "boolean"
  ) {
    return null;
  }

  return {
    id,
    message,
    occurredAt,
    applicationVersion,
    webEngine,
    webEngineVersion,
    lastActions,
    isReadyForObservability
  };
}

function parseVersionConfigurationString(value: string | null): VersionConfiguration | null {
  if (value === null) {
    return null;
  }

  try {
    return parseVersionConfigurationSnapshot(JSON.parse(value) as unknown);
  } catch {
    return null;
  }
}

function parseVersionConfigurationSnapshot(value: unknown): VersionConfiguration | null {
  if (!isRecord(value)) {
    return null;
  }

  const currentVersion = value.currentVersion;
  const latestVersion = value.latestVersion;
  const minimumSupportedVersion = value.minimumSupportedVersion;
  const updatedAt = value.updatedAt;

  if (
    typeof currentVersion !== "string" ||
    typeof latestVersion !== "string" ||
    typeof minimumSupportedVersion !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }

  return {
    currentVersion,
    latestVersion,
    minimumSupportedVersion,
    updatedAt
  };
}

function isApplicationUserAction(value: unknown): value is ApplicationUserAction {
  if (!isRecord(value) || typeof value.type !== "string" || typeof value.occurredAt !== "string") {
    return false;
  }

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
