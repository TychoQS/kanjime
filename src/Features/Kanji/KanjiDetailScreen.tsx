import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { arrowBack, copyOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import type { DisplayKanjiInterface } from "./Contracts/DisplayKanjiInterface";
import type { DetailedKanjiEntry } from "../../Shared/DomainTypes";
import { translate } from "../../Shared/I18n";
import { KanjiEntryRenderProvider, KanjiEntryView } from "./KanjiEntryView";

interface KanjiDetailScreenProps {
  readonly displayKanjiController: DisplayKanjiInterface;
  readonly language: string;
}

interface KanjiRouteParams {
  readonly character: string;
}

interface DetailRouteState {
  readonly skipHistory?: boolean;
}

/**
 * Full kanji detail screen with grouped dictionary information.
 *
 * @pre A valid character route parameter is present.
 * @post Available fields for the selected kanji are rendered in one continuous flow.
 */
export function KanjiDetailScreen(props: KanjiDetailScreenProps): JSX.Element {
  const history = useHistory();
  const location = useLocation<DetailRouteState | undefined>();
  const params = useParams<KanjiRouteParams>();
  const character = decodeURIComponent(params.character);
  const [details, setDetails] = useState<DetailedKanjiEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    void props.displayKanjiController.getKanjiDetails(character)
      .then(nextDetails => {
        setDetails(nextDetails);
        setIsLoading(false);
      })
      .catch(() => {
        setDetails(null);
        setErrorMessage("The character details could not be loaded.");
        setIsLoading(false);
      });
  }, [character, location.state?.skipHistory, props.displayKanjiController, props.language]);

  const onBackRequested = (): void => {
    try {
      props.displayKanjiController.returnToPreviousScreen();
    } catch {
      history.goBack();
    }
  };

  const onCopyRequested = async (): Promise<void> => {
    try {
      await props.displayKanjiController.copyKanjiCharacter(character);
    } catch {
      setErrorMessage("An unexpected error has occurred and the character could not be identified.");
    }
  };

  return (
    <IonPage>
      <IonHeader translucent={false}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              data-testid="kanji-back-button"
              onClick={onBackRequested}
              aria-label="Back"
            >
              <IonIcon icon={arrowBack} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{translate(props.language, "kanjiDetails")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              data-testid="kanji-copy-button"
              disabled={!details}
              onClick={() => void onCopyRequested()}
              aria-label={translate(props.language, "copyKanji")}
            >
              <IonIcon icon={copyOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent data-testid="kanji-detail-screen" scrollY={false}>
        <div className="screen-shell">
          <div className="detail-scroll">
            {isLoading ? (
              <div className="center-state">
                <IonSpinner name="crescent" />
              </div>
            ) : null}

            {errorMessage ? (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            ) : null}

            {details ? (
              <KanjiEntryRenderProvider details={details} language={props.language}>
                <KanjiEntryView
                  character={details.character}
                  meanings={details.meanings ?? []}
                  primaryReadings={[...(details.kunyomi ?? []), ...(details.onyomi ?? [])]}
                  levels={[details.jlptLevel, details.joyoLevel].filter((level): level is string => Boolean(level))}
                  canCopy={true}
                  canGoBack={true}
                  onCopyRequested={() => void onCopyRequested()}
                  onBackRequested={onBackRequested}
                />
              </KanjiEntryRenderProvider>
            ) : null}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
