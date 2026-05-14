import type { KanjiPracticeInterface } from "./Contracts/KanjiPracticeInterface";
import { createKanjiPracticeViewModel } from "./ViewModel/KanjiPracticeViewModel";

/**
 * External collaborators consumed by the kanji practice controller.
 */
export interface CreateKanjiPracticeControllerDependencies {}

/**
 * Creates the kanji practice controller.
 */
export function CreateKanjiPracticeController(
  dependencies: CreateKanjiPracticeControllerDependencies
): KanjiPracticeInterface {
  return createKanjiPracticeViewModel(dependencies);
}
