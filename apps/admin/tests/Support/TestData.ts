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
  errorsFilterPrefix: "admin-errors-filter-",
  errorsStatusPrefix: "admin-errors-status-",
  errorRowPrefix: "admin-error-row-",
  errorStatusPrefix: "admin-error-status-",
  errorOpenButtonPrefix: "admin-error-open-button-",
  errorDetailView: "admin-error-detail-view",
  errorDetailBackButton: "admin-error-detail-back-button",
  errorDetailCurrentStatusValue: "admin-error-detail-current-status-value",
  errorDetailStatusSelectorRow: "admin-error-detail-status-selector-row",
  errorDetailStatusPrefix: "admin-error-detail-status-"
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

export const TEST_ADMIN_FILTER_ALL: AdminErrorFilter = "all";
export const TEST_ADMIN_STATUS_OPEN: AdminErrorStatus = "OPEN";
export const TEST_ADMIN_STATUS_IN_PROGRESS: AdminErrorStatus = "IN_PROGRESS";
export const TEST_ADMIN_STATUS_RESOLVED: AdminErrorStatus = "RESOLVED";
export const TEST_ADMIN_STATUS_CLOSED: AdminErrorStatus = "CLOSED";
export const TEST_ADMIN_STATUS_DISCARDED: AdminErrorStatus = "DISCARDED";
export const TEST_ADMIN_STATUS_UPDATE_TARGET: AdminErrorStatus = TEST_ADMIN_STATUS_RESOLVED;
export const TEST_ADMIN_FILTER_TEST_STATUS: AdminErrorStatus = TEST_ADMIN_STATUS_RESOLVED;
export const TEST_ADMIN_STATUS_ALL_TEST_ID_SEGMENT = "all";
export const TEST_ADMIN_STATUS_SOURCE_SEPARATOR = "_";
export const TEST_ADMIN_STATUS_TEST_ID_SEPARATOR = "-";

export const TEST_ADMIN_E2E_STATUS_ERROR_REPORTS: ReadonlyArray<ApplicationErrorReport> = [
  {
    ...TEST_ADMIN_E2E_ERROR_REPORTS[0],
    id: "report-open",
    status: TEST_ADMIN_STATUS_OPEN
  },
  {
    ...TEST_ADMIN_E2E_ERROR_REPORTS[1],
    id: "report-resolved",
    status: TEST_ADMIN_STATUS_RESOLVED
  }
] as const;

export const TEST_ADMIN_E2E_STATUS_ASSERTION_MESSAGES = {
  seededReports: "The E2E scenario should contain reports with at least two different statuses.",
  filterVisible: "The errors dashboard should expose the visual filter option.",
  assignableStatusVisible: "The errors dashboard should expose each real assignable report status.",
  allOnlyFilter: "The all option should be visible only as a filter and not as an assignable status.",
  filteredList: "The filtered errors list should contain only reports matching the selected status.",
  allList: "The all filter should show every seeded reported error.",
  detailVisible: "The selected error detail should be visible before checking status controls.",
  detailStatusVisible: "The selected error detail should expose each assignable status.",
  detailAllNotAssignable: "The selected error detail should not expose all as an assignable status.",
  detailStatusUpdated: "Selecting an allowed status should update the selected report detail.",
  detailStoredStatusUpdated: "Selecting an allowed status should persist the selected report status in E2E storage."
} as const;

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
