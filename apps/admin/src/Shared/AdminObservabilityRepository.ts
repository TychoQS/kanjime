import type {
  ApplicationErrorReport,
  ApplicationUserAction,
  ObservabilityRepository,
  VersionConfiguration
} from "@kanjime/shared";

const ERROR_REPORTS_KEY = "kanjime.admin.observability.errorReports";
const VERSION_CONFIGURATION_KEY = "kanjime.admin.observability.versionConfiguration";

/**
 * Administration observability repository backed by browser storage.
 */
export class AdminObservabilityRepository implements ObservabilityRepository {
  private readonly fallbackStorage = new Map<string, string>();

  async saveErrorReport(report: ApplicationErrorReport): Promise<void> {
    const reports = await this.listErrorReports();
    const nextReports = [
      ...reports.filter(candidate => candidate.id !== report.id),
      report
    ];

    this.setItem(ERROR_REPORTS_KEY, JSON.stringify(nextReports));
  }

  async listErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>> {
    return parseErrorReports(this.getItem(ERROR_REPORTS_KEY));
  }

  async getErrorReport(id: string): Promise<ApplicationErrorReport | null> {
    const reports = await this.listErrorReports();
    return reports.find(report => report.id === id) ?? null;
  }

  async saveVersionConfiguration(config: VersionConfiguration): Promise<void> {
    this.setItem(VERSION_CONFIGURATION_KEY, JSON.stringify(config));
  }

  async getVersionConfiguration(): Promise<VersionConfiguration | null> {
    return parseVersionConfiguration(this.getItem(VERSION_CONFIGURATION_KEY));
  }

  private getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return this.fallbackStorage.get(key) ?? null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return this.fallbackStorage.get(key) ?? null;
    }
  }

  private setItem(key: string, value: string): void {
    if (typeof window === "undefined") {
      this.fallbackStorage.set(key, value);
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      this.fallbackStorage.set(key, value);
    }
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

function parseVersionConfiguration(value: string | null): VersionConfiguration | null {
  if (value === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const currentVersion = parsed.currentVersion;
    const latestVersion = parsed.latestVersion;
    const minimumSupportedVersion = parsed.minimumSupportedVersion;
    const updatedAt = parsed.updatedAt;

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
  } catch {
    return null;
  }
}

function isApplicationUserAction(value: unknown): value is ApplicationUserAction {
  return isRecord(value) && typeof value.type === "string" && typeof value.occurredAt === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
