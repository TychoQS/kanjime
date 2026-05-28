import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";

import type {
  ApplicationErrorReport,
  ApplicationUserAction,
  ObservabilityRepository,
  VersionConfiguration
} from "@kanjime/shared";
import { getFirebaseFirestore } from "./FirebaseClient";

const ERRORS_COLLECTION = "errors";
const VERSION_CONFIGURATION_COLLECTION = "versionConfiguration";
const CURRENT_VERSION_CONFIGURATION_DOCUMENT = "current";

/**
 * Administration observability repository backed by Firestore.
 */
export class AdminObservabilityRepository implements ObservabilityRepository {
  async saveErrorReport(report: ApplicationErrorReport): Promise<void> {
    await setDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, report.id), report);
  }

  async listErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>> {
    const snapshot = await getDocs(
      query(collection(getFirebaseFirestore(), ERRORS_COLLECTION), orderBy("occurredAt", "desc"))
    );

    return snapshot.docs
      .map(documentSnapshot => parseErrorReport(documentSnapshot.data()))
      .filter((report): report is ApplicationErrorReport => report !== null);
  }

  async getErrorReport(id: string): Promise<ApplicationErrorReport | null> {
    const snapshot = await getDoc(doc(getFirebaseFirestore(), ERRORS_COLLECTION, id));
    return snapshot.exists() ? parseErrorReport(snapshot.data()) : null;
  }

  async saveVersionConfiguration(config: VersionConfiguration): Promise<void> {
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
    const snapshot = await getDoc(
      doc(
        getFirebaseFirestore(),
        VERSION_CONFIGURATION_COLLECTION,
        CURRENT_VERSION_CONFIGURATION_DOCUMENT
      )
    );

    return snapshot.exists() ? parseVersionConfiguration(snapshot.data()) : null;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
