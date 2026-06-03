import type { ApplicationErrorReport, VersionConfiguration } from "@kanjime/shared";

import type { AdminAuthenticatedUser, AdminAuthenticationClient } from "./FirebaseClient";

const ADMIN_E2E_AUTH_USER_KEY = "kanjime.admin.e2e.authUser";
const ADMIN_E2E_VERSION_CONFIGURATION_KEY = "kanjime.admin.e2e.versionConfiguration";
const ADMIN_E2E_ERROR_REPORTS_KEY = "kanjime.admin.e2e.errorReports";

const authListeners = new Set<(user: AdminAuthenticatedUser | null) => void>();
const reportListeners = new Set<(reports: ReadonlyArray<ApplicationErrorReport>) => void>();

export function isAdminE2EMocksEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_E2E_MOCKS === "true";
}

export function createAdminE2EAuthenticationClient(): AdminAuthenticationClient {
  return {
    subscribeToCurrentUser(listener): () => void {
      authListeners.add(listener);
      listener(readAdminE2EAuthenticatedUser());

      return () => {
        authListeners.delete(listener);
      };
    },
    async signInWithGoogle(): Promise<void> {
      const existingUser = readAdminE2EAuthenticatedUser();
      const nextUser = existingUser ?? {
        uid: "e2e-admin",
        email: "admin@example.test",
        displayName: "E2E Administrator"
      };

      writeAdminE2EAuthenticatedUser(nextUser);
      notifyAuthListeners(nextUser);
    },
    async signOut(): Promise<void> {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.removeItem(ADMIN_E2E_AUTH_USER_KEY);
      notifyAuthListeners(null);
    }
  };
}

export function readAdminE2EVersionConfiguration(): VersionConfiguration | null {
  return readJsonValue<VersionConfiguration>(ADMIN_E2E_VERSION_CONFIGURATION_KEY);
}

export function writeAdminE2EVersionConfiguration(configuration: VersionConfiguration): void {
  writeJsonValue(ADMIN_E2E_VERSION_CONFIGURATION_KEY, configuration);
}

export function readAdminE2EErrorReports(): ReadonlyArray<ApplicationErrorReport> {
  const reports = readJsonValue<ReadonlyArray<ApplicationErrorReport>>(ADMIN_E2E_ERROR_REPORTS_KEY);

  return Array.isArray(reports) ? [...reports].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)) : [];
}

export function writeAdminE2EErrorReports(reports: ReadonlyArray<ApplicationErrorReport>): void {
  writeJsonValue(ADMIN_E2E_ERROR_REPORTS_KEY, reports);
  notifyReportListeners();
}

export function subscribeToAdminE2EErrorReports(
  callback: (reports: ReadonlyArray<ApplicationErrorReport>) => void
): () => void {
  reportListeners.add(callback);
  callback(readAdminE2EErrorReports());

  return () => {
    reportListeners.delete(callback);
  };
}

function readAdminE2EAuthenticatedUser(): AdminAuthenticatedUser | null {
  return readJsonValue<AdminAuthenticatedUser>(ADMIN_E2E_AUTH_USER_KEY);
}

function writeAdminE2EAuthenticatedUser(user: AdminAuthenticatedUser): void {
  writeJsonValue(ADMIN_E2E_AUTH_USER_KEY, user);
}

function notifyAuthListeners(user: AdminAuthenticatedUser | null): void {
  for (const listener of authListeners) {
    listener(user);
  }
}

function notifyReportListeners(): void {
  const reports = readAdminE2EErrorReports();

  for (const listener of reportListeners) {
    listener(reports);
  }
}

function readJsonValue<TValue>(key: string): TValue | null {
  if (!isAdminE2EMocksEnabled() || typeof window === "undefined") {
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
  if (!isAdminE2EMocksEnabled() || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
