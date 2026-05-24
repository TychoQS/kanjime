import { IonIcon } from "@ionic/react";
import { arrowBack, checkmark, trash } from "ionicons/icons";

import { CanvasInputView } from "../../Classification/Canvas/CanvasInputView";
import { translate } from "../../../Shared/I18n";
import type { CalligraphyPracticeProps } from "../Contracts/CalligraphyPracticeProps";

/**
 * Active calligraphy practice view.
 */
export function CalligraphyPracticeView(props: CalligraphyPracticeProps): JSX.Element {
  const language = document.documentElement.lang || "en-US";

  if (props.targetCharacter.trim().length === 0) {
    return null as unknown as JSX.Element;
  }

  return (
    <div className="calligraphy-practice" data-testid="calligraphy-practice-screen">
      <div
        className="calligraphy-practice-toolbar"
        data-testid="calligraphy-practice-top-controls"
      >
        <button
          className="calligraphy-control-button"
          data-testid="calligraphy-back-button"
          onClick={props.onBackRequested}
          aria-label={translate(language, "back")}
          type="button"
        >
          <IonIcon icon={arrowBack} />
        </button>
        <button
          className="calligraphy-control-button"
          data-testid="calligraphy-reset-button"
          disabled={!props.canReset}
          onClick={props.onResetRequested}
          aria-label={translate(language, "clear")}
          type="button"
        >
          <IonIcon icon={trash} />
        </button>
        <button
          className="calligraphy-control-button"
          data-testid="calligraphy-validate-button"
          disabled={!props.canValidate}
          onClick={props.onValidateRequested}
          aria-label={translate(language, "validate")}
          type="button"
        >
          <IonIcon icon={checkmark} />
        </button>
      </div>
      <div className="calligraphy-canvas-zone" data-testid="calligraphy-practice-canvas">
        <CanvasInputView
          activeStroke={props.activeStroke ?? null}
          backgroundColor="var(--ion-color-secondary)"
          isDrawingEnabled
          onPointerCancel={props.onPointerCancel ?? (() => undefined)}
          onPointerDown={props.onPointerDown ?? (() => undefined)}
          onPointerMove={props.onPointerMove ?? (() => undefined)}
          onPointerUp={props.onPointerUp ?? (() => undefined)}
          strokeColor="var(--ion-color-primary)"
          strokes={props.strokes}
        />
      </div>
    </div>
  );
}
