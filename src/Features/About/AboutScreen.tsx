import { translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { AboutView } from "./View/AboutView";

/**
 * Application information screen using MVVM architecture.
 *
 * @pre The about controller is initialized in the composition root.
 * @post The About screen presents information obtained from the view model.
 */
export function AboutScreen(): JSX.Element {
  const { about, preferences } = useAppViewModelContext();

  return (
    <MobilePage title={translate(preferences.preferences.language, "about")} testId="about-screen">
      <div className="screen-shell">
        <div className="detail-scroll">
          <AboutView items={about.items} language={preferences.preferences.language} />
        </div>
      </div>
    </MobilePage>
  );
}
