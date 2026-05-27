import type { AdminErrorDetail } from "@kanjime/shared";

import type { AdminErrorDetailInterface } from "../Contracts/AdminErrorDetailInterface";
import type { CreateAdminErrorDetailControllerDependencies } from "../CreateAdminErrorDetailController";

const NOT_IMPLEMENTED_MESSAGE = "Not implemented yet";

/**
 * Creates the admin error detail view model.
 */
export function createAdminErrorDetailViewModel(
  dependencies: CreateAdminErrorDetailControllerDependencies
): AdminErrorDetailInterface {
  void dependencies;

  return {
    async getErrorDetail(_errorId: string): Promise<AdminErrorDetail> {
      throw new Error(NOT_IMPLEMENTED_MESSAGE);
    }
  };
}
