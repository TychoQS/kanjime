import { IonContent } from "@ionic/react";

import type { NavigationProps } from "./Contracts/NavigationProps";

/**
 * Application navigation menu.
 */
export function NavigationView(props: NavigationProps): JSX.Element | null {
  if (!props.isMenuOpen) {
    return null;
  }

  return (
    <IonContent data-testid="navigation-view">
      <nav aria-label="Application navigation">
        <button aria-label="Close navigation" onClick={props.onCloseRequested} type="button">
          Close
        </button>
        <ul role="menu">
          {props.availablePages.map(page => (
            <li key={page.id}>
              <button
                aria-current={page.id === props.currentPage ? "page" : undefined}
                aria-pressed={page.id === props.currentPage}
                onClick={() => props.onNavigateRequested(page.id)}
                role="menuitem"
                type="button"
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </IonContent>
  );
}
