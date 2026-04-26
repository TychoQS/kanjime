import React, { createContext, useContext } from "react";

import type { ApplicationComposition } from "./CompositionRoot";

const ApplicationContext = createContext<ApplicationComposition | null>(null);

/**
 * Provides the application composition to React screens.
 */
export const ApplicationProvider = ApplicationContext.Provider;

/**
 * Reads the application composition.
 *
 * @returns Composition root.
 *
 * @post A composition root is available to the caller.
 */
export function useApplicationComposition(): ApplicationComposition {
  const composition = useContext(ApplicationContext);

  if (composition === null) {
    throw new Error("Application dependencies are not ready.");
  }

  return composition;
}
