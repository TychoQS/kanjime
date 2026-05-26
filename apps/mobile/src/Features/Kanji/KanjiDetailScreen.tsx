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
import { translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { KanjiEntryRenderProvider, KanjiEntryView } from "./KanjiEntryView";

/**
 * Full kanji detail screen with grouped dictionary information.
 *
 * @pre A valid character route parameter is present.
 * @post Available fields for the selected kanji are rendered in one continuous flow.
 */
export function KanjiDetailScreen(): JSX.Element {
  const { kanji, preferences } = useAppViewModelContext();
  const details = kanji.details;
  return (
    <IonPage>
      <IonHeader translucent={false}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              data-testid="kanji-back-button"
              onClick={() => kanji.returnToPreviousScreen()}
              aria-label="Back"
            >
              <IonIcon icon={arrowBack} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{translate(preferences.preferences.language, "kanjiDetails")}</IonTitle>
          <IonButtons slot="end">
            <IonButton
              data-testid="kanji-copy-button"
              disabled={!details}
              onClick={() => void kanji.copyKanjiCharacter()}
              aria-label={translate(preferences.preferences.language, "copyKanji")}
            >
              <IonIcon icon={copyOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent data-testid="kanji-detail-screen" scrollY={false}>
        <div className="screen-shell">
          <div className="detail-scroll">
            {kanji.isLoading ? (
              <div className="center-state">
                <IonSpinner name="crescent" />
              </div>
            ) : null}

            {kanji.errorMessage ? (
              <IonText color="danger">
                <p>{kanji.errorMessage}</p>
              </IonText>
            ) : null}

            {details ? (
              <KanjiEntryRenderProvider details={details} language={preferences.preferences.language}>
                <KanjiEntryView
                  character={details.character}
                  meanings={details.meanings ?? []}
                  primaryReadings={[...(details.kunyomi ?? []), ...(details.onyomi ?? [])]}
                  levels={[details.jlptLevel, details.joyoLevel].filter((level): level is string => Boolean(level))}
                  canCopy={true}
                  canGoBack={true}
                  onCopyRequested={() => void kanji.copyKanjiCharacter()}
                  onBackRequested={() => kanji.returnToPreviousScreen()}
                />
              </KanjiEntryRenderProvider>
            ) : null}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
