import type { AdminVersionFormState } from "@kanjime/shared";

/**
 * Props contract for the administration version configuration form.
 *
 * Requirement IDs: R27.
 *
 * @pre The administrator enters an invalid version value.
 * @inv Invalid configuration values are not saved and ambiguous validation messages are not shown.
 * @post The administrator sees a clear validation message explaining the invalid version format.
 */
export interface AdminVersionFormProps {
  readonly state: AdminVersionFormState;
  readonly onCurrentVersionChanged: (value: string) => void;
  readonly onLatestVersionChanged: (value: string) => void;
  readonly onMinimumSupportedVersionChanged: (value: string) => void;
  readonly onSaveRequested: () => void;
}
