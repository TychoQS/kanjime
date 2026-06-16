import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AdminErrorDetail,
  AdminErrorFilter,
  AdminErrorStatus,
  AdminErrorSummary,
  AdminTechnicalSummary,
  AdminVersionFormState,
  AdminVersionSummary,
  VersionConfiguration
} from "@kanjime/shared";

import type { AdminCompositionRoot } from "../../CompositionRoot";
import type { AdminAuthenticatedUser } from "../../Shared/FirebaseClient";
import { AdminDashboardView } from "../Dashboard/View/AdminDashboardView";
import { AdminErrorDetailView } from "../Errors/View/AdminErrorDetailView";
import { AdminErrorsView } from "../Errors/View/AdminErrorsView";
import { AdminVersionsView } from "../Versions/View/AdminVersionsView";

type AdminSection = "dashboard" | "versions" | "errors" | "errorDetail";

interface AdminShellViewProps {
  readonly composition: AdminCompositionRoot;
}

const EMPTY_VERSION_SUMMARY: AdminVersionSummary = {
  currentVersion: "",
  latestVersion: "",
  minimumSupportedVersion: "",
  updatedAt: ""
};
const ADMIN_TITLE = "KanjiMe Admin";
const AUTH_LOADING_MESSAGE = "Loading administrator session.";
const AUTH_ERROR_MESSAGE = "The administrator session could not be started.";
const SIGN_IN_TITLE = "Administrator sign in";
const SIGN_IN_DESCRIPTION = "Use a Google account to access version configuration and error reports.";
const SIGNING_IN_LABEL = "Signing in";
const SIGN_IN_LABEL = "Sign in with Google";
const SIGN_OUT_LABEL = "Sign out";
const ADMIN_ERROR_FILTERS: ReadonlyArray<AdminErrorFilter> = ["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "DISCARDED"];
const ADMIN_ERROR_STATUSES: ReadonlyArray<AdminErrorStatus> = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "DISCARDED"];
const ALL_ERRORS_FILTER: AdminErrorFilter = "all";

/**
 * Administration shell that composes feature views and navigation.
 */
export function AdminShellView(props: AdminShellViewProps): JSX.Element {
  const { composition } = props;
  const [authUser, setAuthUser] = useState<AdminAuthenticatedUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [dashboardSummary, setDashboardSummary] = useState<AdminTechnicalSummary | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [versionSummary, setVersionSummary] = useState<AdminVersionSummary>(EMPTY_VERSION_SUMMARY);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [versionConfiguration, setVersionConfiguration] = useState<VersionConfiguration>(
    composition.createInitialVersionConfiguration()
  );
  const [errors, setErrors] = useState<ReadonlyArray<AdminErrorSummary>>([]);
  const [activeErrorsFilter, setActiveErrorsFilter] = useState<AdminErrorFilter>("all");
  const [errorsMessage, setErrorsMessage] = useState<string | null>(null);
  const [isErrorsLoading, setIsErrorsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<AdminErrorDetail | null>(null);
  const [errorDetailMessage, setErrorDetailMessage] = useState<string | null>(null);
  const [isErrorDetailLoading, setIsErrorDetailLoading] = useState(false);

  const formState = useMemo<AdminVersionFormState>(
    () => composition.versionFormController.validateVersionConfiguration(versionConfiguration),
    [composition.versionFormController, versionConfiguration]
  );

  useEffect(() => {
    return composition.authentication.subscribeToCurrentUser(user => {
      setAuthUser(user);
      setIsAuthReady(true);
    });
  }, [composition.authentication]);

  const loadDashboard = useCallback(async (): Promise<void> => {
    if (authUser === null) {
      return;
    }

    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      setDashboardSummary(await composition.dashboardController.loadTechnicalSummary());
    } catch {
      setDashboardSummary(null);
      setDashboardError("The technical summary could not be loaded.");
    } finally {
      setIsDashboardLoading(false);
    }
  }, [authUser, composition.dashboardController]);

  const loadVersions = useCallback(async (): Promise<void> => {
    if (authUser === null) {
      return;
    }

    setIsVersionsLoading(true);
    setVersionsError(null);

    try {
      const configuration = await composition.loadVersionConfiguration();

      if (configuration === null) {
        setVersionSummary(EMPTY_VERSION_SUMMARY);
        setVersionsError("The version configuration is not available.");
        return;
      }

      setVersionConfiguration(configuration);
      setVersionSummary(await composition.versionsController.getVersionSummary(configuration));
    } catch {
      setVersionSummary(EMPTY_VERSION_SUMMARY);
      setVersionsError("The version configuration could not be loaded.");
    } finally {
      setIsVersionsLoading(false);
    }
  }, [authUser, composition]);

  const loadErrors = useCallback(async (filter: AdminErrorFilter): Promise<void> => {
    if (authUser === null) {
      return;
    }

    setIsErrorsLoading(true);
    setErrorsMessage(null);

    try {
      setErrors(await composition.errorsController.filterReportedErrors(filter));
    } catch {
      setErrors([]);
      setErrorsMessage("The reported errors could not be loaded.");
    } finally {
      setIsErrorsLoading(false);
    }
  }, [authUser, composition.errorsController]);

  const openErrorDetail = useCallback(
    async (errorId: string): Promise<void> => {
      if (authUser === null) {
        return;
      }

      setActiveSection("errorDetail");
      setIsErrorDetailLoading(true);
      setErrorDetailMessage(null);

      try {
        setErrorDetail(await composition.errorDetailController.getErrorDetail(errorId));
      } catch {
        setErrorDetail(null);
        setErrorDetailMessage("The selected error could not be loaded.");
      } finally {
        setIsErrorDetailLoading(false);
      }
    },
    [authUser, composition.errorDetailController]
  );

  const selectErrorsFilter = useCallback(
    (filter: AdminErrorFilter): void => {
      setActiveErrorsFilter(filter);
      void loadErrors(filter);
    },
    [loadErrors]
  );

  const updateSelectedErrorStatus = useCallback(
    async (status: AdminErrorStatus): Promise<void> => {
      if (authUser === null || errorDetail === null) {
        return;
      }

      setIsErrorDetailLoading(true);
      setErrorDetailMessage(null);

      try {
        const updatedDetail = await composition.errorDetailController.updateErrorStatus(errorDetail.id, status);
        setErrorDetail(updatedDetail);
        setErrors(await composition.errorsController.filterReportedErrors(activeErrorsFilter));
      } catch {
        setErrorDetailMessage("The selected error status could not be updated.");
      } finally {
        setIsErrorDetailLoading(false);
      }
    },
    [
      activeErrorsFilter,
      authUser,
      composition.errorDetailController,
      composition.errorsController,
      errorDetail
    ]
  );

  useEffect(() => {
    if (authUser === null) {
      return;
    }

    if (activeSection === "dashboard") {
      void loadDashboard();
      if (composition.dashboardController.subscribeToSummary) {
        return composition.dashboardController.subscribeToSummary(updatedSummary => {
          setDashboardSummary(updatedSummary);
        });
      }
    }

    if (activeSection === "versions") {
      void loadVersions();
    }

    if (activeSection === "errors") {
      void loadErrors(activeErrorsFilter);
      if (composition.errorsController.subscribeToErrors) {
        return composition.errorsController.subscribeToErrors(updatedErrors => {
          setErrors(filterErrorSummaries(updatedErrors, activeErrorsFilter));
        });
      }
    }
  }, [activeErrorsFilter, activeSection, authUser, loadDashboard, loadErrors, loadVersions, composition]);

  const saveVersionConfiguration = async (): Promise<void> => {
    if (!formState.canSave || authUser === null) {
      return;
    }

    const savedConfiguration = await composition.versionFormController.saveVersionConfiguration({
      ...versionConfiguration,
      updatedAt: new Date().toISOString()
    });
    setVersionConfiguration(savedConfiguration);
    setVersionSummary(await composition.versionsController.getVersionSummary(savedConfiguration));
    setActiveSection("versions");
  };

  const signIn = async (): Promise<void> => {
    setIsSigningIn(true);
    setAuthErrorMessage(null);

    try {
      await composition.authentication.signInWithGoogle();
    } catch {
      setAuthErrorMessage(AUTH_ERROR_MESSAGE);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthErrorMessage(null);
    await composition.authentication.signOut();
  };

  if (!isAuthReady) {
    return (
      <IonPage data-testid="admin-auth-loading-screen">
        <IonContent fullscreen>
          <main className="admin-shell">
            <IonSpinner name="crescent" />
            <p className="admin-muted">{AUTH_LOADING_MESSAGE}</p>
          </main>
        </IonContent>
      </IonPage>
    );
  }

  if (authUser === null) {
    return (
      <IonPage data-testid="admin-sign-in-screen">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{ADMIN_TITLE}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <main className="admin-shell">
            <section className="admin-panel" aria-labelledby="admin-sign-in-title">
              <h2 id="admin-sign-in-title">{SIGN_IN_TITLE}</h2>
              <p className="admin-muted">{SIGN_IN_DESCRIPTION}</p>
              {authErrorMessage !== null ? (
                <IonText color="danger">
                  <p role="alert" data-testid="admin-auth-error-message">{authErrorMessage}</p>
                </IonText>
              ) : null}
              <IonButton data-testid="admin-sign-in-button" disabled={isSigningIn} onClick={() => {
                void signIn();
              }}>
                {isSigningIn ? SIGNING_IN_LABEL : SIGN_IN_LABEL}
              </IonButton>
            </section>
          </main>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage data-testid="admin-shell-screen">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{ADMIN_TITLE}</IonTitle>
          <IonButtons slot="end" className="admin-navigation">
            <IonButton data-testid="admin-nav-dashboard-button" onClick={() => setActiveSection("dashboard")}>Dashboard</IonButton>
            <IonButton data-testid="admin-nav-versions-button" onClick={() => setActiveSection("versions")}>Versions</IonButton>
            <IonButton data-testid="admin-nav-errors-button" onClick={() => setActiveSection("errors")}>Errors</IonButton>
            <IonButton data-testid="admin-sign-out-button" onClick={() => {
              void signOut();
            }}>
              {SIGN_OUT_LABEL}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <main className="admin-shell">
          {activeSection === "dashboard" ? (
            <AdminDashboardView
              summary={dashboardSummary}
              isLoading={isDashboardLoading}
              errorMessage={dashboardError}
            />
          ) : null}
          {activeSection === "versions" ? (
            <AdminVersionsView
              summary={versionSummary}
              isLoading={isVersionsLoading}
              errorMessage={versionsError}
              state={formState}
              onCurrentVersionChanged={value =>
                setVersionConfiguration(current => ({ ...current, currentVersion: value }))
              }
              onLatestVersionChanged={value =>
                setVersionConfiguration(current => ({ ...current, latestVersion: value }))
              }
              onMinimumSupportedVersionChanged={value =>
                setVersionConfiguration(current => ({ ...current, minimumSupportedVersion: value }))
              }
              onSaveRequested={() => {
                void saveVersionConfiguration();
              }}
            />
          ) : null}
          {activeSection === "errors" ? (
            <AdminErrorsView
              errors={errors}
              isLoading={isErrorsLoading}
              errorMessage={errorsMessage}
              activeFilter={activeErrorsFilter}
              availableFilters={ADMIN_ERROR_FILTERS}
              availableStatuses={ADMIN_ERROR_STATUSES}
              onFilterSelected={selectErrorsFilter}
              onErrorSelected={errorId => {
                void openErrorDetail(errorId);
              }}
            />
          ) : null}
          {activeSection === "errorDetail" ? (
            <AdminErrorDetailView
              detail={errorDetail}
              isLoading={isErrorDetailLoading}
              errorMessage={errorDetailMessage}
              availableStatuses={ADMIN_ERROR_STATUSES}
              onStatusSelected={status => {
                void updateSelectedErrorStatus(status);
              }}
              onBackRequested={() => setActiveSection("errors")}
            />
          ) : null}
        </main>
      </IonContent>
    </IonPage>
  );
}

function filterErrorSummaries(
  errors: ReadonlyArray<AdminErrorSummary>,
  filter: AdminErrorFilter
): ReadonlyArray<AdminErrorSummary> {
  return filter === ALL_ERRORS_FILTER ? errors : errors.filter(error => error.status === filter);
}
