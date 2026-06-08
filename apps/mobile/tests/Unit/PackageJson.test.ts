import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const PACKAGE_JSON_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../package.json");

describe("package.json", () => {
  it("keeps the mobile e2e script aligned with the expected mock build flow", () => {
    const packageJsonText = readFileSync(PACKAGE_JSON_PATH, "utf8");
    const packageJson = JSON.parse(packageJsonText) as {
      readonly scripts: Readonly<Record<string, string>>;
    };
    const script = packageJson.scripts["test:e2e"];

    expect(script).toContain("VITE_ENABLE_E2E_MOCKS=true");
    expect(packageJsonText).not.toContain("--pass-with-no-tests");
  });
});
