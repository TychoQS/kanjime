import { translate } from "../../Shared/I18n";
import { useAppViewModelContext } from "../../Shared/AppViewModelContext";
import { MobilePage } from "../Shell/MobilePage";
import { AboutView } from "./View/AboutView";

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
