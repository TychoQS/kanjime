import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type Unsubscribe,
  type User
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { createAdminE2EAuthenticationClient, isAdminE2EMocksEnabled } from "./E2EMocks";

const FIREBASE_ENV_KEYS = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID"
} as const;

let cachedFirestore: Firestore | null = null;
let cachedAuth: Auth | null = null;

export interface AdminAuthenticatedUser {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
}

export interface AdminAuthenticationClient {
  readonly subscribeToCurrentUser: (listener: (user: AdminAuthenticatedUser | null) => void) => Unsubscribe;
  readonly signInWithGoogle: () => Promise<void>;
  readonly signOut: () => Promise<void>;
}

/**
 * Returns the configured Firebase client application for administration infrastructure.
 */
export function getFirebaseApplication(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(readFirebaseOptions());
}

/**
 * Returns the Firestore client used by administration infrastructure repositories.
 */
export function getFirebaseFirestore(): Firestore {
  if (cachedFirestore === null) {
    cachedFirestore = getFirestore(getFirebaseApplication());
  }

  return cachedFirestore;
}

/**
 * Returns the Google-authenticated administration client.
 */
export function createAdminAuthenticationClient(): AdminAuthenticationClient {
  if (isAdminE2EMocksEnabled()) {
    return createAdminE2EAuthenticationClient();
  }

  return {
    subscribeToCurrentUser(listener): Unsubscribe {
      return onAuthStateChanged(getFirebaseAuth(), user => listener(toAdminAuthenticatedUser(user)));
    },
    async signInWithGoogle(): Promise<void> {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    },
    signOut(): Promise<void> {
      return signOut(getFirebaseAuth());
    }
  };
}

function getFirebaseAuth(): Auth {
  if (cachedAuth === null) {
    cachedAuth = getAuth(getFirebaseApplication());
  }

  return cachedAuth;
}

function toAdminAuthenticatedUser(user: User | null): AdminAuthenticatedUser | null {
  if (user === null) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName
  };
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
