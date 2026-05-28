import { IonToast } from "@ionic/react";

import { translate } from "../../../Shared/I18n";
import type { UpdateAvailableProps } from "../Contracts/UpdateAvailableProps";

/**
 * Non-blocking update availability notice rendered as a bottom toast.
 */
export function UpdateAvailableView(props: UpdateAvailableProps): JSX.Element {
  const language =
    typeof document !== "undefined" && document.documentElement.lang
      ? document.documentElement.lang
      : "en-US";

  return (
    <IonToast
      isOpen={props.isVisible}
      message={props.message}
      position="bottom"
      data-testid="update-available-view"
      buttons={
        props.canContinueUsingApplication
          ? [
              {
                text: translate(language, "ok"),
                role: "cancel",
                htmlAttributes: { "data-testid": "update-available-dismiss-button" }
              }
            ]
          : []
      }
      onDidDismiss={props.onDismissRequested}
    />
  );
}

