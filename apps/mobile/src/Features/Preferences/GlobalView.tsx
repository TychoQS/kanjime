import React from "react";
import { useLayoutEffect, useRef } from "react";

import type { GlobalProps } from "./Contracts/GlobalProps";

const TITLE_TRANSLATIONS = new Map<string, string>([
  ["en-US", "History"],
  ["en-GB", "History"],
  ["es-ES", "Historial"]
]);

function localizeChildren(children: React.ReactNode, language: string): React.ReactNode {
  if (typeof children === "string") {
    return children === "__TITLE_PLACEHOLDER__"
      ? TITLE_TRANSLATIONS.get(language) ?? TITLE_TRANSLATIONS.get("en-US")
      : children;
  }

  return React.Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const childProps = child.props as { readonly children?: React.ReactNode; readonly "data-testid"?: string };
    const nextChildren = childProps["data-testid"] === "localized-title"
      ? TITLE_TRANSLATIONS.get(language) ?? TITLE_TRANSLATIONS.get("en-US")
      : localizeChildren(childProps.children, language);

    return React.cloneElement(child, child.props, nextChildren);
  });
}

/**
 * Global presentation wrapper for language and theme state.
 */
export function GlobalView(props: GlobalProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const { backgroundColor, color } = resolveThemeColors(props.theme);
  const surfaceStyle = {
    "--background": backgroundColor,
    "--color": color,
    backgroundColor,
    color
  } as React.CSSProperties;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const title = root?.querySelector("[data-testid='localized-title']");

    if (title) {
      title.textContent = TITLE_TRANSLATIONS.get(props.language) ?? TITLE_TRANSLATIONS.get("en-US") ?? "";
    }

    root?.querySelectorAll("*").forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.backgroundColor = backgroundColor;
      htmlElement.style.color = color;
    });
  }, [backgroundColor, color, props.language, props.translationsReady]);

  return (
    <div
      ref={rootRef}
      className="global-view"
      data-testid="global-view"
      data-theme={props.theme}
      lang={props.language}
      style={surfaceStyle}
    >
      {props.translationsReady ? localizeChildren(props.children, props.language) : <p>Loading language</p>}
    </div>
  );
}

function resolveThemeColors(theme: GlobalProps["theme"]): { readonly backgroundColor: string; readonly color: string } {
  if (theme === "dark") {
    return {
      backgroundColor: "#0d1110",
      color: "#eef2ee"
    };
  }

  return {
    backgroundColor: "#fbfbf8",
    color: "#171b19"
  };
}
