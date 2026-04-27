import { IonIcon } from "@ionic/react";
import { close, informationCircleOutline, scanOutline, search, timeOutline } from "ionicons/icons";

import type { NavigationProps } from "./Contracts/NavigationProps";

const PAGE_ICONS: Record<string, string> = {
  classification: scanOutline,
  search: search,
  history: timeOutline,
  about: informationCircleOutline
};

/**
 * Application navigation menu.
 *
 * @pre Available pages and navigation callbacks are provided.
 * @post Renders the navigation list with active state identification and accessible roles.
 */
export function NavigationView(props: NavigationProps): JSX.Element | null {
  if (!props.isMenuOpen) {
    return null;
  }

  return (
    <div data-testid="navigation-view" className="menu-shell">
      <nav aria-label="Application navigation">
        <ul role="menu" className="menu-list" style={{ listStyle: "none", padding: 0 }}>
          {props.availablePages.map(page => (
            <li key={page.id} className={props.currentPage === page.id ? "menu-item-active" : ""}>
              <button
                aria-current={page.id === props.currentPage ? "page" : undefined}
                aria-pressed={page.id === props.currentPage}
                onClick={() => props.onNavigateRequested(page.id)}
                role="menuitem"
                type="button"
                className="menu-item-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "12px 16px",
                  textAlign: "left",
                  color: "inherit",
                  font: "inherit"
                }}
              >
                <IonIcon icon={PAGE_ICONS[page.id]} style={{ marginRight: "16px" }} />
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button
        aria-label="Close navigation"
        onClick={props.onCloseRequested}
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: "12px 16px",
          width: "100%",
          color: "inherit",
          font: "inherit",
          cursor: "pointer"
        }}
      >
        <IonIcon icon={close} style={{ marginRight: "16px" }} />
        Cerrar
      </button>
    </div>
  );
}
