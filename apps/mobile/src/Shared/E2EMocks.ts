import type { ApplicationErrorReport, VersionConfiguration } from "@kanjime/shared";

const MOBILE_E2E_VERSION_CONFIGURATION_KEY = "kanjime.e2e.versionConfiguration";
const MOBILE_E2E_LAST_KNOWN_VERSION_CONFIGURATION_KEY = "kanjime.e2e.lastKnownVersionConfiguration";
const MOBILE_E2E_VERSION_CHECK_SHOULD_FAIL_KEY = "kanjime.e2e.versionCheckShouldFail";
const MOBILE_E2E_ERROR_REPORTS_KEY = "kanjime.e2e.errorReports";
const MOBILE_E2E_ANONYMOUS_CLIENT_ID_KEY = "kanjime.e2e.anonymousClientId";

export function isMobileE2EMocksEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_E2E_MOCKS === "true";
}

export function readMobileE2ERemoteVersionConfiguration(): VersionConfiguration | null {
  return readJsonValue<VersionConfiguration>(MOBILE_E2E_VERSION_CONFIGURATION_KEY);
}

export function readMobileE2ELastKnownVersionConfiguration(): VersionConfiguration | null {
  return readJsonValue<VersionConfiguration>(MOBILE_E2E_LAST_KNOWN_VERSION_CONFIGURATION_KEY);
}

export function writeMobileE2ELastKnownVersionConfiguration(configuration: VersionConfiguration): void {
  writeJsonValue(MOBILE_E2E_LAST_KNOWN_VERSION_CONFIGURATION_KEY, configuration);
}

export function shouldFailMobileE2ERemoteVersionCheck(): boolean {
  return readJsonValue<boolean>(MOBILE_E2E_VERSION_CHECK_SHOULD_FAIL_KEY) === true;
}

export function readMobileE2EErrorReports(): ReadonlyArray<ApplicationErrorReport> {
  const reports = readJsonValue<ReadonlyArray<ApplicationErrorReport>>(MOBILE_E2E_ERROR_REPORTS_KEY);

  return Array.isArray(reports) ? reports : [];
}

export function writeMobileE2EErrorReports(reports: ReadonlyArray<ApplicationErrorReport>): void {
  writeJsonValue(MOBILE_E2E_ERROR_REPORTS_KEY, reports);
}

export function readMobileE2EAnonymousClientId(): string | null {
  const identifier = readJsonValue<string>(MOBILE_E2E_ANONYMOUS_CLIENT_ID_KEY);

  if (typeof identifier !== "string") {
    return null;
  }

  const normalizedIdentifier = identifier.trim();

  return normalizedIdentifier.length > 0 ? normalizedIdentifier : null;
}

export function writeMobileE2EAnonymousClientId(identifier: string): void {
  writeJsonValue(MOBILE_E2E_ANONYMOUS_CLIENT_ID_KEY, identifier);
}

function readJsonValue<TValue>(key: string): TValue | null {
  if (!isMobileE2EMocksEnabled() || typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(key);

  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as TValue;
  } catch {
    return null;
  }
}

function writeJsonValue<TValue>(key: string, value: TValue): void {
  if (!isMobileE2EMocksEnabled() || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
