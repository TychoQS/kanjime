import React from "react";

/**
 * A probe component used to verify that global environment settings (language and theme)
 * are correctly propagated and applied to the component tree.
 */
export const EnvironmentProbe = ({ language, theme }: { language: string; theme: string }) => {
  const translations: Record<string, string> = {
    "en-US": "Hello",
    "es-ES": "Hola"
  };

  const isDark = theme === "dark";

  return (
    <div data-testid="environment-probe" style={{ padding: "10px" }}>
      <span data-testid="translated-text">{translations[language] || "Unknown"}</span>
      <div
        data-testid="themed-box"
        style={{
          backgroundColor: isDark ? "#000" : "#fff",
          color: isDark ? "#fff" : "#000"
        }}
      >
        Contrast Check
      </div>
    </div>
  );
};
