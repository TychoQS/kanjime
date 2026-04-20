import { IonApp } from "@ionic/react";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Renders a React node inside the Ionic app shell.
 */
export function renderWithIonic(element: ReactElement): RenderResult {
  return render(<IonApp>{element}</IonApp>);
}
