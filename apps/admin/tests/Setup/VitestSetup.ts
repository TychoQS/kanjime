import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});
