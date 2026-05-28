import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AdminErrorDetail,
  AdminErrorSummary,
  AdminTechnicalSummary,
  AdminVersionFormState,
  AdminVersionSummary,
  VersionConfiguration
} from "@kanjime/shared";

import type { AdminCompositionRoot } from "../../CompositionRoot";
import { AdminDashboardView } from "../Dashboard/View/AdminDashboardView";
import { AdminErrorDetailView } from "../Errors/View/AdminErrorDetailView";
import { AdminErrorsView } from "../Errors/View/AdminErrorsView";
import { AdminVersionFormView } from "../Versions/View/AdminVersionFormView";
import { AdminVersionsView } from "../Versions/View/AdminVersionsView";

type AdminSection = "dashboard" | "versions" | "versionForm" | "errors" | "errorDetail";

interface AdminShellViewProps {
  readonly composition: AdminCompositionRoot;
}

const EMPTY_VERSION_SUMMARY: AdminVersionSummary = {
  currentVersion: "",
  latestVersion: "",
  minimumSupportedVersion: "",
  updatedAt: ""
};

/**
 * Administration shell that composes feature views and navigation.
 */
export function AdminShellView(props: AdminShellViewProps): JSX.Element {
  const { composition } = props;
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
  const [errorsMessage, setErrorsMessage] = useState<string | null>(null);
  const [isErrorsLoading, setIsErrorsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<AdminErrorDetail | null>(null);
  const [errorDetailMessage, setErrorDetailMessage] = useState<string | null>(null);
  const [isErrorDetailLoading, setIsErrorDetailLoading] = useState(false);

  const formState = useMemo<AdminVersionFormState>(
    () => composition.versionFormController.validateVersionConfiguration(versionConfiguration),
    [composition.versionFormController, versionConfiguration]
  );

  const loadDashboard = useCallback(async (): Promise<void> => {
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
  }, [composition.dashboardController]);

  const loadVersions = useCallback(async (): Promise<void> => {
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
  }, [composition]);

  const loadErrors = useCallback(async (): Promise<void> => {
    setIsErrorsLoading(true);
    setErrorsMessage(null);

    try {
      setErrors(await composition.errorsController.listReportedErrors());
    } catch {
      setErrors([]);
      setErrorsMessage("The reported errors could not be loaded.");
    } finally {
      setIsErrorsLoading(false);
    }
  }, [composition.errorsController]);

  const openErrorDetail = useCallback(
    async (errorId: string): Promise<void> => {
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
    [composition.errorDetailController]
  );

  useEffect(() => {
    if (activeSection === "dashboard") {
      void loadDashboard();
    }

    if (activeSection === "versions" || activeSection === "versionForm") {
      void loadVersions();
    }

    if (activeSection === "errors") {
      void loadErrors();
    }
  }, [activeSection, loadDashboard, loadErrors, loadVersions]);

  const saveVersionConfiguration = async (): Promise<void> => {
    if (!formState.canSave) {
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

  return (
    <IonPage data-testid="admin-shell-screen">
      <IonHeader>
        <IonToolbar>
          <IonTitle>KanjiMe Admin</IonTitle>
          <IonButtons slot="end" className="admin-navigation">
            <IonButton onClick={() => setActiveSection("dashboard")}>Dashboard</IonButton>
            <IonButton onClick={() => setActiveSection("versions")}>Versions</IonButton>
            <IonButton onClick={() => setActiveSection("versionForm")}>Edit version</IonButton>
            <IonButton onClick={() => setActiveSection("errors")}>Errors</IonButton>
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
            />
          ) : null}
          {activeSection === "versionForm" ? (
            <AdminVersionFormView
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
              onBackRequested={() => setActiveSection("errors")}
            />
          ) : null}
        </main>
      </IonContent>
    </IonPage>
  );
}
