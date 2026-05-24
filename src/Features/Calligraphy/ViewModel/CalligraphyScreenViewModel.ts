import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";

import type { CalligraphyCanvasInterface } from "../Contracts/CalligraphyCanvasInterface";
import type { CalligraphyEvaluationInterface } from "../Contracts/CalligraphyEvaluationInterface";
import type { CalligraphyInterface } from "../Contracts/CalligraphyInterface";
import type { CategoryInterface } from "../Contracts/CategoryInterface";
import type { KanjiPracticeInterface } from "../Contracts/KanjiPracticeInterface";
import type { CanvasInteractionViewModel } from "../../Classification/Canvas/ViewModel/CanvasViewModel";
import type {
  CalligraphyCategory,
  CalligraphyEvaluationFeedback,
  CalligraphyGrouping,
  CalligraphyKanjiSummary,
  Stroke
} from "../../../Shared/DomainTypes";

type CalligraphyScreenMode = "home" | "category" | "practice";

export interface CalligraphyScreenViewModelDependencies {
  readonly calligraphyController: CalligraphyInterface;
  readonly categoryController: CategoryInterface;
  readonly calligraphyCanvasController: CalligraphyCanvasInterface;
  readonly kanjiPracticeController: KanjiPracticeInterface;
  readonly calligraphyEvaluationController: CalligraphyEvaluationInterface;
  readonly canvasInteraction: CanvasInteractionViewModel;
}

export interface CalligraphyScreenViewModel {
  readonly mode: CalligraphyScreenMode;
  readonly activeGrouping: CalligraphyGrouping;
  readonly categories: ReadonlyArray<CalligraphyCategory>;
  readonly selectedCategoryId: string | null;
  readonly categoryKanji: ReadonlyArray<CalligraphyKanjiSummary>;
  readonly targetCharacter: string | null;
  readonly strokes: ReadonlyArray<Stroke>;
  readonly activeStroke: Stroke | null;
  readonly feedback: CalligraphyEvaluationFeedback | null;
  readonly errorMessage: string | null;
  selectGrouping(grouping: CalligraphyGrouping): void;
  openCategory(categoryId: string): Promise<void>;
  returnHome(): Promise<void>;
  startPractice(character: string): Promise<void>;
  returnToCategory(): Promise<void>;
  resetPractice(): void;
  validatePractice(): Promise<void>;
  dismissFeedback(): void;
  dismissError(): void;
  beginStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  continueStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void;
  completeStroke(): void;
  cancelStroke(): void;
}

export function useCalligraphyScreenViewModel(
  dependencies: CalligraphyScreenViewModelDependencies,
  isEnabled: boolean
): CalligraphyScreenViewModel {
  const location = useLocation();
  const history = useHistory();

  const [mode, setMode] = useState<CalligraphyScreenMode>("home");
  const [activeGrouping, setActiveGrouping] = useState(dependencies.calligraphyController.getActiveGrouping());
  const [categories, setCategories] = useState(dependencies.calligraphyController.getVisibleCategories());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryKanji, setCategoryKanji] = useState<ReadonlyArray<CalligraphyKanjiSummary>>([]);
  const [targetCharacter, setTargetCharacter] = useState<string | null>(null);
  const [strokes, setStrokes] = useState(dependencies.calligraphyCanvasController.getStrokeHistory());
  const [feedback, setFeedback] = useState<CalligraphyEvaluationFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryMatch = matchPath<{ categoryId: string }>(location.pathname, {
    path: "/calligraphy/category/:categoryId",
    exact: true
  });
  const practiceMatch = matchPath<{ character: string }>(location.pathname, {
    path: "/calligraphy/practice/:character",
    exact: true
  });

  const refreshCategories = useCallback(() => {
    setActiveGrouping(dependencies.calligraphyController.getActiveGrouping());
    setCategories(dependencies.calligraphyController.getVisibleCategories());
  }, [dependencies.calligraphyController]);

  const refreshStrokes = useCallback(() => {
    setStrokes(dependencies.calligraphyCanvasController.getStrokeHistory());
  }, [dependencies.calligraphyCanvasController]);

  useEffect(() => {
    if (isEnabled) {
      refreshCategories();
    }
  }, [isEnabled, refreshCategories]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let isMounted = true;

    const syncRoute = async () => {
      if (practiceMatch) {
        const char = decodeURIComponent(practiceMatch.params.character);
        if (targetCharacter !== char || mode !== "practice") {
          try {
            await dependencies.categoryController.startPractice(char);
            if (isMounted) {
              try {
                dependencies.calligraphyCanvasController.resetAttempt();
              } catch {
                // no-op
              }
              dependencies.canvasInteraction.cancelStroke();
              setTargetCharacter(char);
              setFeedback(null);
              setStrokes(dependencies.calligraphyCanvasController.getStrokeHistory());
              setMode("practice");
            }
          } catch (e) {
            if (isMounted) {
              setErrorMessage("calligraphyError");
            }
          }
        }
      } else if (categoryMatch) {
        const catId = decodeURIComponent(categoryMatch.params.categoryId);
        if (selectedCategoryId !== catId || mode !== "category") {
          try {
            await dependencies.calligraphyController.openCategory(catId);
            const kanji = await dependencies.categoryController.getKanjiByCategory(catId);
            if (isMounted) {
              setSelectedCategoryId(catId);
              setCategoryKanji(kanji);
              setTargetCharacter(null);
              setFeedback(null);
              setMode("category");
            }
          } catch (e) {
            if (isMounted) {
              setErrorMessage("calligraphyError");
            }
          }
        }
      } else {
        if (mode !== "home") {
          try {
            await dependencies.categoryController.returnToCalligraphyHome();
            if (isMounted) {
              setMode("home");
              setSelectedCategoryId(null);
              setCategoryKanji([]);
              setTargetCharacter(null);
              setFeedback(null);
              setActiveGrouping(dependencies.calligraphyController.getActiveGrouping());
              setCategories(dependencies.calligraphyController.getVisibleCategories());
            }
          } catch (e) {
            // no-op
          }
        }
      }
    };

    void syncRoute();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, isEnabled, dependencies, targetCharacter, selectedCategoryId, mode]);

  return {
    mode,
    activeGrouping,
    categories,
    selectedCategoryId,
    categoryKanji,
    targetCharacter,
    strokes,
    activeStroke: dependencies.canvasInteraction.activeStroke,
    feedback,
    errorMessage,
    selectGrouping(grouping: CalligraphyGrouping): void {
      dependencies.calligraphyController.selectGrouping(grouping);
      refreshCategories();
    },
    openCategory(categoryId: string): Promise<void> {
      history.push(`/calligraphy/category/${encodeURIComponent(categoryId)}`);
      return Promise.resolve();
    },
    returnHome(): Promise<void> {
      history.goBack();
      return Promise.resolve();
    },
    startPractice(character: string): Promise<void> {
      history.push(`/calligraphy/practice/${encodeURIComponent(character)}`);
      return Promise.resolve();
    },
    returnToCategory(): Promise<void> {
      history.goBack();
      return Promise.resolve();
    },
    resetPractice(): void {
      dependencies.calligraphyCanvasController.resetAttempt();
      dependencies.canvasInteraction.cancelStroke();
      setFeedback(null);
      refreshStrokes();
    },
    async validatePractice(): Promise<void> {
      if (targetCharacter === null || selectedCategoryId === null) {
        return;
      }

      setErrorMessage(null);

      try {
        const result = await dependencies.kanjiPracticeController.requestEvaluation({
          targetCharacter,
          categoryId: selectedCategoryId,
          strokes: dependencies.calligraphyCanvasController.getStrokeHistory(),
          isFinalized: true
        });

        setFeedback(dependencies.calligraphyEvaluationController.createFeedback(result));
      } catch {
        setErrorMessage("calligraphyError");
      }
    },
    dismissFeedback(): void {
      setFeedback(null);
    },
    dismissError(): void {
      setErrorMessage(null);
    },
    beginStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void {
      dependencies.canvasInteraction.beginStroke(event, canvas);
    },
    continueStroke(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement | null): void {
      dependencies.canvasInteraction.continueStroke(event, canvas);
    },
    completeStroke(): void {
      const stroke = dependencies.canvasInteraction.commitStroke();

      if (stroke === null) {
        return;
      }

      dependencies.calligraphyCanvasController.registerStroke(stroke);
      refreshStrokes();
    },
    cancelStroke(): void {
      dependencies.canvasInteraction.cancelStroke();
    }
  };
}
