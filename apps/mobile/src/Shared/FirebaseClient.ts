import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const FIREBASE_ENV_KEYS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID"
} as const;

let cachedFirestore: Firestore | null = null;

/**
 * Returns the configured Firebase client application for mobile infrastructure.
 */
export function getFirebaseApplication(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(readFirebaseOptions());
}

/**
 * Returns the Firestore client used by mobile infrastructure repositories.
 */
export function getFirebaseFirestore(): Firestore {
  if (cachedFirestore === null) {
    cachedFirestore = getFirestore(getFirebaseApplication());
  }

  return cachedFirestore;
}

function readFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.apiKey),
    authDomain: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.authDomain),
    projectId: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.projectId),
    storageBucket: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.storageBucket),
    messagingSenderId: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.messagingSenderId),
    appId: readRequiredFirebaseEnv(FIREBASE_ENV_KEYS.appId)
  };
}

function readRequiredFirebaseEnv(key: (typeof FIREBASE_ENV_KEYS)[keyof typeof FIREBASE_ENV_KEYS]): string {
  const value = import.meta.env[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("The Firebase client configuration is incomplete.");
  }

  return value;
}
