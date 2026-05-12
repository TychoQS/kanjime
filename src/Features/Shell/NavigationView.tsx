import { IonIcon } from "@ionic/react";
import { close, informationCircleOutline, scanOutline, search, timeOutline } from "ionicons/icons";

import { translate } from "../../Shared/I18n";
import type { NavigationProps } from "./Contracts/NavigationProps";

const PAGE_ICONS: Record<string, string> = {
  classification: scanOutline,
  search: search,
  history: timeOutline,
  about: informationCircleOutline
};

export function NavigationView(props: NavigationProps): JSX.Element | null {
  const language = typeof document !== "undefined" && document.documentElement.lang 
    ? document.documentElement.lang 
    : "en-US";

  if (!props.isMenuOpen) {
    return null;
  }

  return (
    <div data-testid="navigation-view" className="menu-shell">
      <nav aria-label="Application navigation">
        <ul role="menu" className="menu-list">
          {props.availablePages.map(page => (
            <li key={page.id} className={props.currentPage === page.id ? "menu-item-active" : ""}>
              <button
                data-testid={`nav-${page.id}`}
                aria-current={page.id === props.currentPage ? "page" : undefined}
                aria-pressed={page.id === props.currentPage}
                onClick={() => props.onNavigateRequested(page.id)}
                role="menuitem"
                type="button"
                className="menu-item-button"
              >
                <IonIcon className="menu-item-icon" icon={PAGE_ICONS[page.id]} />
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button
        aria-label="Close navigation"
        className="menu-close-button"
        onClick={props.onCloseRequested}
        type="button"
      >
        <IonIcon className="menu-item-icon" icon={close} />
        {translate(language, "close")}
      </button>
    </div>
  );
}
