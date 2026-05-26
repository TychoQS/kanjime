import React from "react";
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { setupIonicReact } from "@ionic/react";
import { afterEach, vi } from "vitest";
import "../../src/Theme/Variables.css";

vi.mock("@ionic/react", async importOriginal => {
  const actual = await importOriginal<typeof import("@ionic/react")>();

  return {
    ...actual,

    IonApp: ({ children, ...props }: any) =>
      React.createElement(
        "div",
        {
          ...props,
          "data-testid": props["data-testid"] ?? "ion-app",
        },
        children
      ),

    IonIcon: ({ icon, name, "aria-label": ariaLabel, ...props }: any) =>
      React.createElement("span", {
        ...props,
        "data-testid": props["data-testid"] ?? "ion-icon",
        "aria-label": ariaLabel ?? name ?? icon ?? "icon",
      }),
  };
});

class ResizeObserverStub {
  observe(): void { }

  unobserve(): void { }

  disconnect(): void { }
}

class ImageDataStub {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;

  constructor(dataOrWidth: Uint8ClampedArray | number, width?: number, height?: number) {
    if (dataOrWidth instanceof Uint8ClampedArray && typeof width === "number" && typeof height === "number") {
      this.data = dataOrWidth;
      this.width = width;
      this.height = height;
      return;
    }

    const resolvedWidth = typeof dataOrWidth === "number" ? dataOrWidth : 1;
    const resolvedHeight = typeof width === "number" ? width : 1;

    this.width = resolvedWidth;
    this.height = resolvedHeight;
    this.data = new Uint8ClampedArray(resolvedWidth * resolvedHeight * 4);
  }
}

/**
 * Shared Vitest setup for React, Ionic, and DOM polyfills.
 */
setupIonicReact({ _testing: true });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;
}

if (!("ImageData" in globalThis)) {
  globalThis.ImageData = ImageDataStub as typeof ImageData;
}

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => null),
});