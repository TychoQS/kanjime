import type { ApplicationUserAction } from "@kanjime/shared";

const MAX_ACTIONS = 10;

/**
 * Keeps the latest user actions as execution context for observability reports.
 */
export class UserActionTracker {
  private readonly actions: ApplicationUserAction[] = [];

  record(action: ApplicationUserAction): void {
    this.actions.push(action);

    if (this.actions.length > MAX_ACTIONS) {
      this.actions.splice(0, this.actions.length - MAX_ACTIONS);
    }
  }

  listRecentActions(): ReadonlyArray<ApplicationUserAction> {
    return this.actions.map(action => ({ ...action }));
  }
}
