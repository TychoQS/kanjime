import type { ApplicationErrorReport, VersionConfiguration } from "./DomainTypes";

/**
 * Shared repository surface for mobile observability and version state.
 */
export interface ObservabilityRepository {
  /**
   * Persists a structured application error report.
   */
  saveErrorReport(report: ApplicationErrorReport): Promise<void>;

  /**
   * Lists persisted application error reports.
   */
  listErrorReports(): Promise<ReadonlyArray<ApplicationErrorReport>>;

  /**
   * Returns one persisted error report by identifier.
   */
  getErrorReport(id: string): Promise<ApplicationErrorReport | null>;

  /**
   * Persists the latest known version configuration.
   */
  saveVersionConfiguration(config: VersionConfiguration): Promise<void>;

  /**
   * Returns the latest known version configuration.
   */
  getVersionConfiguration(): Promise<VersionConfiguration | null>;
}
