import type { CalligraphyCategory, CalligraphyGrouping } from "../../../Shared/DomainTypes";

/**
 * Contract for the main calligraphy category selection flow.
 *
 * @inv The active grouping can only be JLPT or Joyo.
 * @inv Displayed categories always belong exclusively to the active grouping.
 * @inv The residual category remains available only when unclassified kanji exist.
 */
export interface CalligraphyInterface {
  /**
   * Returns the currently active calligraphy grouping.
   *
   * Requirement IDs: R42.
   *
   * @pre The user is on the main calligraphy screen.
   * @post The returned value identifies the single active grouping.
   */
  getActiveGrouping(): CalligraphyGrouping;

  /**
   * Activates the requested grouping and deactivates the previous one.
   *
   * Requirement IDs: R42.
   *
   * @pre The user is on the main calligraphy screen.
   * @post The active grouping changes to the grouping selected by the user.
   */
  selectGrouping(grouping: CalligraphyGrouping): void;

  /**
   * Returns categories that belong to the active grouping.
   *
   * Requirement IDs: R43, R44.
   *
   * @pre The user is on the main calligraphy screen.
   * @post The application exposes the categories corresponding to the selected grouping, including the residual category when applicable.
   */
  getVisibleCategories(): ReadonlyArray<CalligraphyCategory>;

  /**
   * Opens the selected category list.
   *
   * Requirement IDs: R46.
   *
   * @pre The user is on the main calligraphy screen and the category belongs to the active grouping.
   * @post The application shows the kanji list that belongs to the selected category.
   */
  openCategory(categoryId: string): Promise<void>;
}
