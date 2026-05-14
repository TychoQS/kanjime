import type { CalligraphyCategory, CalligraphyGrouping } from "../../../Shared/DomainTypes";

/**
 * Props contract for the main calligraphy screen.
 *
 * Requirement IDs: R17, R18.
 *
 * @pre The user is on the main calligraphy screen.
 * @inv The active grouping is visible to the user.
 * @inv Categories remain grouped by the active level or category grouping.
 * @post The interface visually identifies the active JLPT or Joyo grouping and presents categories in an ordered navigable way.
 */
export interface CalligraphyProps {
  readonly activeGrouping: CalligraphyGrouping;
  readonly categories: ReadonlyArray<CalligraphyCategory>;
  readonly onGroupingSelected: (grouping: CalligraphyGrouping) => void;
  readonly onCategorySelected: (categoryId: string) => void;
}
