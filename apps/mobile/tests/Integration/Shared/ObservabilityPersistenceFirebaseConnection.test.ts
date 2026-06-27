import { describe, expect, it } from "vitest";

import { ObservabilityPersistence } from "../../../src/Shared/ObservabilityPersistence";

const SEMANTIC_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

describe("ObservabilityPersistence Firebase connection", () => {
  it("reads live version configuration from Firebase", async () => {
    const repository = new ObservabilityPersistence();

    const configuration = await repository.getVersionConfiguration();

    expect(import.meta.env.VITE_ENABLE_E2E_MOCKS).not.toBe("true");
    expect(configuration).not.toBeNull();
    expect(configuration?.currentVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(configuration?.latestVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(configuration?.minimumSupportedVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(Number.isNaN(Date.parse(configuration?.updatedAt ?? ""))).toBe(false);
  }, 30_000);
});
