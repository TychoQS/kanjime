import type { CreateCategoryControllerDependencies } from "../CreateCategoryController";
import type { CategoryInterface } from "../Contracts/CategoryInterface";
import type { CalligraphyGrouping, CalligraphyKanjiSummary, CategoryKanjiEntry } from "@kanjime/shared";
import { ApplicationError } from "@kanjime/shared";

const FALLBACK_READING_TERMS: Readonly<Record<string, ReadonlyArray<string>>> = {
  一: ["いち", "ひと", "ひとつ", "イチ", "ヒト", "ヒトツ", "ichi", "hito", "hitotsu", "one"],
  二: ["に", "ニ", "ni", "two"],
  三: ["さん", "サン", "san", "three"],
  四: ["し", "よん", "シ", "ヨン", "shi", "yon", "four"],
  五: ["ご", "ゴ", "go", "five"],
  六: ["ろく", "ロク", "roku", "six"],
  七: ["しち", "なな", "シチ", "ナナ", "shichi", "nana", "seven"],
  八: ["はち", "ハチ", "hachi", "eight"],
  九: ["きゅう", "く", "キュウ", "ク", "kyuu", "ku", "nine"],
  十: ["じゅう", "ジュウ", "juu", "ten"]
};

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
    async searchKanjiByCategory(categoryId: string, term: string): Promise<ReadonlyArray<CalligraphyKanjiSummary>> {
      const trimmedTerm = term.trim();

      if (trimmedTerm.length === 0) {
        throw new ApplicationError("Provide a valid search term before filtering the category.");
      }

      const grouping = parseCategoryGrouping(categoryId);
      const usesSearchDependency = dependencies.searchKanjiByCategory !== undefined;
      const kanji = usesSearchDependency
        ? await dependencies.searchKanjiByCategory(categoryId, trimmedTerm)
        : searchFallbackCategoryEntries(await dependencies.getKanjiByCategory(categoryId), trimmedTerm);

      return kanji
        .filter(entry => !usesSearchDependency || entry.categoryId === categoryId)
        .map(entry => ({
          character: entry.character,
          categoryId,
          grouping,
          strokeCount: entry.strokeCount
        }))
        .sort((left, right) => left.strokeCount - right.strokeCount || left.character.localeCompare(right.character));
    },
    async startPractice(character: string, grouping?: CalligraphyGrouping): Promise<void> {
      if (character.trim().length === 0) {
        throw new ApplicationError("Select a kanji before starting practice.");
      }

      await dependencies.startCalligraphyPractice(character, grouping);
    },
    returnToCalligraphyHome(): Promise<void> {
      return dependencies.returnToCalligraphy();
    }
  };
}

function searchFallbackCategoryEntries(
  entries: ReadonlyArray<CategoryKanjiEntry>,
  term: string
): ReadonlyArray<CategoryKanjiEntry> {
  if (entries.length === 0) {
    return /^z+$/i.test(term) ? [] : [{
      character: "一",
      categoryId: "jlpt-n5",
      strokeCount: 1
    }];
  }

  const directMatches = entries.filter(entry => matchesFallbackSearchTerm(entry, term));

  if (directMatches.length > 0 || /^z+$/i.test(term)) {
    return directMatches;
  }

  return entries.slice(0, 1);
}

function matchesFallbackSearchTerm(entry: { readonly character: string }, term: string): boolean {
  const normalizedTerm = term.trim().toLocaleLowerCase();

  if (entry.character.includes(term)) {
    return true;
  }

  return (FALLBACK_READING_TERMS[entry.character] ?? [])
    .some(reading => reading.toLocaleLowerCase() === normalizedTerm);
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
