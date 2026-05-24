import type { CalligraphyCategory, CalligraphyGrouping } from "../../../Shared/DomainTypes";

/**
 * Props contract for the main calligraphy screen.
 *
 * Requirement IDs: R17, R18.
 *
 * @pre The user is on the main calligraphy screen.
 */
export interface CalligraphyProps {
  /**
   * Requirement ID: R17
   *
   * @inv The active grouping is visible to the user.
   * @post The interface visually identifies the active JLPT or Joyo grouping
   */
  readonly activeGrouping: CalligraphyGrouping;

  /**
   * Requirement ID: R18.
   *
   * @inv Categories remain grouped by the active level or category grouping.
   * @post The interface presents categories in an ordered navigable way.
   */
  readonly categories: ReadonlyArray<CalligraphyCategory>;
  readonly onGroupingSelected: (grouping: CalligraphyGrouping) => void;
  readonly onCategorySelected: (categoryId: string) => void;
}
