import type { UserPreferenceInterface } from "./Contracts/UserPreferenceInterface";
import type { ApplicationTheme } from "@kanjime/shared";
import { createUserPreferenceViewModel } from "./ViewModel/UserPreferenceViewModel";

/**
 * External collaborators consumed by the preference controller.
 */
export interface CreateUserPreferenceControllerDependencies {
  readonly applyLanguage: (language: string) => Promise<void> | void;
  readonly applyTheme: (theme: ApplicationTheme) => Promise<void> | void;
}

/**
 * Creates the preference controller.
 */
export function CreateUserPreferenceController(
  dependencies: CreateUserPreferenceControllerDependencies
): UserPreferenceInterface {
  return createUserPreferenceViewModel(dependencies);
}
