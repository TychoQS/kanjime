import { describe, expect, it } from "vitest";

import { AdminObservabilityRepository } from "../../../src/Shared/AdminObservabilityRepository";

const SEMANTIC_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

describe("AdminObservabilityRepository Firebase connection", () => {
  it("reads live version configuration from Firebase", async () => {
    const repository = new AdminObservabilityRepository();

    const configuration = await repository.getVersionConfiguration();

    expect(import.meta.env.VITE_ENABLE_E2E_MOCKS).not.toBe("true");
    expect(configuration).not.toBeNull();
    expect(configuration?.currentVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(configuration?.latestVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(configuration?.minimumSupportedVersion).toMatch(SEMANTIC_VERSION_PATTERN);
    expect(Number.isNaN(Date.parse(configuration?.updatedAt ?? ""))).toBe(false);
  }, 30_000);
});
