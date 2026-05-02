if (typeof window === "undefined") {
  (globalThis as any).window = globalThis;
  (global as any).window = globalThis;
}
if (typeof self === "undefined") {
  (globalThis as any).self = globalThis;
  (global as any).self = globalThis;
}

import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { setupIonicReact } from "@ionic/react";
import { afterEach, vi } from "vitest";
import "../../src/Theme/Variables.css";

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
  vi.clearAllTimers();
});

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub;
}

if (!("ImageData" in globalThis)) {
  globalThis.ImageData = ImageDataStub as typeof ImageData;
}

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
      };
    }
  });
}

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = function () {
    return null;
  };
}
