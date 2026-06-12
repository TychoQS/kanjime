import type { AdminAuthenticatedUser } from "../../src/Shared/FirebaseClient";
import type {
  AdminErrorDetail,
  AdminErrorFilter,
  AdminErrorStatus,
  AdminErrorSummary,
  ApplicationErrorReport,
  ApplicationUserAction,
  VersionConfiguration
} from "@kanjime/shared";

export const TEST_ADMIN_E2E_STORAGE_KEYS = {
  authUser: "kanjime.admin.e2e.authUser",
  versionConfiguration: "kanjime.admin.e2e.versionConfiguration",
  errorReports: "kanjime.admin.e2e.errorReports"
} as const;

export const TEST_ADMIN_E2E_TEST_IDS = {
  authLoadingScreen: "admin-auth-loading-screen",
  signInScreen: "admin-sign-in-screen",
  signInButton: "admin-sign-in-button",
  shellScreen: "admin-shell-screen",
  navDashboardButton: "admin-nav-dashboard-button",
  navVersionsButton: "admin-nav-versions-button",
  navErrorsButton: "admin-nav-errors-button",
  signOutButton: "admin-sign-out-button",
  dashboardView: "admin-dashboard-view",
  dashboardVersionCard: "admin-dashboard-version-card",
  dashboardErrorsCard: "admin-dashboard-errors-card",
  dashboardCurrentVersionValue: "admin-dashboard-current-version-value",
  dashboardLatestVersionValue: "admin-dashboard-latest-version-value",
  dashboardMinimumVersionValue: "admin-dashboard-minimum-version-value",
  dashboardTotalReportsValue: "admin-dashboard-total-reports-value",
  dashboardLatestReportValue: "admin-dashboard-latest-report-value",
  versionsView: "admin-versions-view",
  versionsEditButton: "admin-versions-edit-button",
  versionsCancelButton: "admin-versions-cancel-button",
  versionCurrentValue: "admin-version-current-value",
  versionLatestValue: "admin-version-latest-value",
  versionMinimumValue: "admin-version-minimum-value",
  versionUpdatedAtValue: "admin-version-updated-at-value",
  versionCurrentInput: "admin-version-current-input",
  versionLatestInput: "admin-version-latest-input",
  versionMinimumInput: "admin-version-minimum-input",
  versionValidationMessage: "admin-version-validation-message",
  versionSaveButton: "admin-version-save-button",
  errorsView: "admin-errors-view",
  errorsList: "admin-errors-list",
  errorDetailView: "admin-error-detail-view",
  errorDetailBackButton: "admin-error-detail-back-button"
} as const;

export const TEST_ADMIN_E2E_ROUTES = {
  root: "/"
} as const;

export const TEST_ADMIN_E2E_AUTH_USER: AdminAuthenticatedUser = {
  uid: "e2e-admin",
  email: "admin@example.test",
  displayName: "E2E Administrator"
};

export const TEST_ADMIN_E2E_VERSION_CONFIGURATION: VersionConfiguration = {
  currentVersion: "1.0.0",
  latestVersion: "1.1.0",
  minimumSupportedVersion: "0.9.0",
  updatedAt: "2026-06-02T09:00:00.000Z"
};

export const TEST_ADMIN_E2E_UPDATED_VERSION_CONFIGURATION: VersionConfiguration = {
  currentVersion: "1.0.1",
  latestVersion: "1.1.1",
  minimumSupportedVersion: "0.9.5",
  updatedAt: "2026-06-03T10:00:00.000Z"
};

export const TEST_ADMIN_E2E_INVALID_VERSION_VALUE = "1.invalid.0";
export const TEST_ADMIN_E2E_VALIDATION_MESSAGE = "Enter a valid semantic version.";
export const TEST_ADMIN_E2E_SENSITIVE_FRAGMENT = "@example.test";

export const TEST_ADMIN_E2E_LAST_ACTIONS: ReadonlyArray<ApplicationUserAction> = [
  {
    type: "navigation:opened",
    page: "classification",
    occurredAt: "2026-06-02T08:00:00.000Z"
  },
  {
    type: "classification:inference-requested",
    mode: "image",
    hadResults: true,
    occurredAt: "2026-06-02T08:00:10.000Z"
  },
  {
    type: "error:captured",
    occurredAt: "2026-06-02T08:00:20.000Z"
  }
] as const;

export const TEST_ADMIN_E2E_ERROR_REPORTS: ReadonlyArray<ApplicationErrorReport> = [
  {
    id: "report-002",
    message: "The photo could not be captured.",
    occurredAt: "2026-06-02T11:00:00.000Z",
    applicationVersion: "1.0.1",
    webEngine: "web",
    webEngineVersion: "126.0",
    lastActions: TEST_ADMIN_E2E_LAST_ACTIONS,
    isReadyForObservability: true
  },
  {
    id: "report-001",
    message: "An unexpected error has occurred. You can keep using the application.",
    occurredAt: "2026-06-02T10:00:00.000Z",
    applicationVersion: "1.0.0",
    webEngine: "web",
    webEngineVersion: "126.0",
    lastActions: TEST_ADMIN_E2E_LAST_ACTIONS,
    isReadyForObservability: true
  }
] as const;

export const TEST_ADMIN_ERROR_STATUSES: ReadonlyArray<AdminErrorStatus> = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "DISCARDED"
];

export const TEST_ADMIN_ERROR_FILTERS: ReadonlyArray<AdminErrorFilter> = [
  "all",
  ...TEST_ADMIN_ERROR_STATUSES
];

export const TEST_ADMIN_ERROR_SUMMARIES: ReadonlyArray<AdminErrorSummary> = [
  {
    id: "admin-error-open",
    message: "The camera permission was denied.",
    occurredAt: "2026-06-05T10:00:00.000Z",
    applicationVersion: "1.2.0",
    status: "OPEN",
    contextSummary: "web 126.0"
  },
  {
    id: "admin-error-resolved",
    message: "The recognition worker was restarted.",
    occurredAt: "2026-06-05T11:00:00.000Z",
    applicationVersion: "1.2.1",
    status: "RESOLVED",
    contextSummary: "android 125.1"
  }
];

export const TEST_ADMIN_ERROR_DETAIL: AdminErrorDetail = {
  id: "admin-error-open",
  message: "The camera permission was denied.",
  occurredAt: "2026-06-05T10:00:00.000Z",
  applicationVersion: "1.2.0",
  status: "OPEN",
  context: {
    applicationVersion: "1.2.0",
    webEngine: "web",
    webEngineVersion: "126.0",
    anonymousClientId: "anon-installation-001",
    lastActions: TEST_ADMIN_E2E_LAST_ACTIONS
  }
};
