import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, onSnapshot } from "firebase/firestore";

import type {
  AdminErrorStatus,
  ApplicationErrorReport,
  ApplicationUserAction,
  ObservabilityRepository,
  VersionConfiguration
} from "@kanjime/shared";
import {
  isAdminE2EMocksEnabled,
  readAdminE2EErrorReports,
  readAdminE2EVersionConfiguration,
  subscribeToAdminE2EErrorReports,
  writeAdminE2EErrorReports,
  writeAdminE2EVersionConfiguration
} from "./E2EMocks";
import { getFirebaseFirestore } from "./FirebaseClient";

const ERRORS_COLLECTION = "errors";
const VERSION_CONFIGURATION_COLLECTION = "versionConfiguration";
const CURRENT_VERSION_CONFIGURATION_DOCUMENT = "current";
const DEFAULT_ADMIN_ERROR_STATUS: AdminErrorStatus = "OPEN";
const ADMIN_ERROR_STATUSES = new Set<AdminErrorStatus>([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "DISCARDED"
]);

/**
 * Administration observability repository backed by Firestore.
 */
export class AdminObservabilityRepository implements ObservabilityRepository {
  async saveErrorReport(report: ApplicationErrorReport): Promise<void> {
    if (isAdminE2EMocksEnabled()) {
      const nextReports = [
        ...readAdminE2EErrorReports().filter(candidate => candidate.id !== report.id),
        report
      ];
      writeAdminE2EErrorReports(nextReports);
      return;
    }

    await setDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, report.id), report);
  }

  async listErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>> {
    if (isAdminE2EMocksEnabled()) {
      return readAdminE2EErrorReports();
    }

    const snapshot = await getDocs(
      query(collection(getFirebaseFirestore(), ERRORS_COLLECTION), orderBy("occurredAt", "desc"))
    );

    return snapshot.docs
      .map(documentSnapshot => parseErrorReport(documentSnapshot.data()))
      .filter((report): report is ApplicationErrorReport => report !== null);
  }

  async getErrorReport(id: string): Promise<ApplicationErrorReport | null> {
    if (isAdminE2EMocksEnabled()) {
      return readAdminE2EErrorReports().find(report => report.id === id) ?? null;
    }

    const snapshot = await getDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, id));
    return snapshot.exists() ? parseErrorReport(snapshot.data()) : null;
  }

  async saveVersionConfiguration(config: VersionConfiguration): Promise<void> {
    if (isAdminE2EMocksEnabled()) {
      writeAdminE2EVersionConfiguration(config);
      return;
    }

    await setDoc(
      doc(
        getFirebaseFirestore(),
        VERSION_CONFIGURATION_COLLECTION,
        CURRENT_VERSION_CONFIGURATION_DOCUMENT
      ),
      config
    );
  }

  async getVersionConfiguration(): Promise<VersionConfiguration | null> {
    if (isAdminE2EMocksEnabled()) {
      return readAdminE2EVersionConfiguration();
    }

    const snapshot = await getDoc(
      doc(
        getFirebaseFirestore(),
        VERSION_CONFIGURATION_COLLECTION,
        CURRENT_VERSION_CONFIGURATION_DOCUMENT
      )
    );

    return snapshot.exists() ? parseVersionConfiguration(snapshot.data()) : null;
  }

  subscribeToErrors(callback: (errors: ReadonlyArray<ApplicationErrorReport>) => void): () => void {
    if (isAdminE2EMocksEnabled()) {
      return subscribeToAdminE2EErrorReports(callback);
    }

    return onSnapshot(
      query(collection(getFirebaseFirestore(), ERRORS_COLLECTION), orderBy("occurredAt", "desc")),
      snapshot => {
        const reports = snapshot.docs
          .map(documentSnapshot => parseErrorReport(documentSnapshot.data()))
          .filter((report): report is ApplicationErrorReport => report !== null);
        callback(reports);
      }
    );
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
  const anonymousClientId = value.anonymousClientId;
  const status = value.status;
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
    anonymousClientId: typeof anonymousClientId === "string" ? anonymousClientId : undefined,
    status: isAdminErrorStatus(status) ? status : DEFAULT_ADMIN_ERROR_STATUS,
    lastActions,
    isReadyForObservability
  };
}

function parseVersionConfiguration(value: unknown): VersionConfiguration | null {
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
  return isRecord(value) && typeof value.type === "string" && typeof value.occurredAt === "string";
}

function isAdminErrorStatus(value: unknown): value is AdminErrorStatus {
  return typeof value === "string" && ADMIN_ERROR_STATUSES.has(value as AdminErrorStatus);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
