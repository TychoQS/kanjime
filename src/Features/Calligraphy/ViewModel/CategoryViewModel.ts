import type { CreateCategoryControllerDependencies } from "../CreateCategoryController";
import type { CategoryInterface } from "../Contracts/CategoryInterface";
import type { CalligraphyGrouping, CalligraphyKanjiSummary } from "../../../Shared/DomainTypes";
import { ApplicationError } from "../../../Shared/AppErrors";

/**
 * Creates the selected category view model.
 */
export function createCategoryViewModel(
  dependencies: CreateCategoryControllerDependencies
): CategoryInterface {
  return {
    async getKanjiByCategory(categoryId: string): Promise<ReadonlyArray<CalligraphyKanjiSummary>> {
      const grouping = parseCategoryGrouping(categoryId);
      const seenCharacters = new Set<string>();
      const kanji = await dependencies.getKanjiByCategory(categoryId);

      return kanji
        .filter(entry => {
          if (entry.categoryId !== categoryId || seenCharacters.has(entry.character)) {
            return false;
          }

          seenCharacters.add(entry.character);
          return true;
        })
        .map(entry => ({
          character: entry.character,
          categoryId: entry.categoryId,
          grouping,
          strokeCount: entry.strokeCount
        }))
        .sort((left, right) => left.strokeCount - right.strokeCount);
    },
    async startPractice(character: string): Promise<void> {
      if (character.trim().length === 0) {
        throw new ApplicationError("Select a kanji before starting practice.");
      }

      await dependencies.startCalligraphyPractice(character);
    },
    returnToCalligraphyHome(): Promise<void> {
      return dependencies.returnToCalligraphy();
    }
  };
}

function parseCategoryGrouping(categoryId: string): CalligraphyGrouping {
  if (categoryId.startsWith("jlpt-")) {
    return "jlpt";
  }

  if (categoryId.startsWith("joyo-")) {
    return "joyo";
  }

  throw new ApplicationError("Select a valid calligraphy category.");
}
