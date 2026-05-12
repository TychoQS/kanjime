import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Shared Vitest configuration for unit and integration coverage.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/Setup/VitestSetup.ts"],
    include: ["tests/Unit/**/*.test.{ts,tsx}", "tests/Integration/**/*.test.{ts,tsx}"],
    exclude: ["tests/E2E/**"],
    css: true
  }
});
