import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

type ThemeMode = "system" | "light" | "dark";

interface AppContextValue {
  language: string;
  themeMode: ThemeMode;
  setLanguage: (language: string) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Provides the initial global state required by the mobile shell.
 *
 * @post Child components can consume the selected language and theme mode.
 */
export function AppContextProvider({
  children
}: PropsWithChildren): JSX.Element {
  const [language, setLanguage] = useState("en-US");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const value = useMemo(
    () => ({
      language,
      themeMode,
      setLanguage,
      setThemeMode
    }),
    [language, themeMode]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Reads the application context.
 *
 * @pre The hook must be called within AppContextProvider.
 * @post Returns the current language and theme state.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("App context is not available.");
  }

  return context;
}
