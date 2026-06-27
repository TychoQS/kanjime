import { getId, getInstallations } from "firebase/installations";

import { getFirebaseApplication } from "./FirebaseClient";

/**
 * Reads the anonymous Firebase installation identifier for observability reports.
 */
export async function readFirebaseInstallationId(): Promise<string | null> {
  try {
    const installations = getInstallations(getFirebaseApplication());
    const identifier = await getId(installations);
    const normalizedIdentifier = identifier.trim();

    return normalizedIdentifier.length > 0 ? normalizedIdentifier : null;
  } catch {
    return null;
  }
}
