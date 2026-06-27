import { IonAlert } from "@ionic/react";

import { translate } from "../../../Shared/I18n";
import type { ErrorProps } from "../Contracts/ErrorProps";

/**
 * Controlled user-facing error interface rendered as a native alert overlay.
 */
export function ErrorView(props: ErrorProps): JSX.Element {
  const language =
    typeof document !== "undefined" && document.documentElement.lang
      ? document.documentElement.lang
      : "en-US";

  return (
    <IonAlert
      isOpen={props.isVisible}
      data-testid="controlled-error-view"
      message={props.message}
      buttons={
        props.canContinue
          ? [
              {
                text: translate(language, "ok"),
                role: "cancel",
                htmlAttributes: { "data-testid": "controlled-error-dismiss-button" }
              }
            ]
          : []
      }
      onDidDismiss={props.onDismissRequested}
    />
  );
}

