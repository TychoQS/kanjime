/**
 * Builds a consistent test title containing requirement metadata.
 *
 * @param requirementId - The requirement or scenario identifier (e.g. "R1", "MODEL-LOAD").
 * @param testType - Whether this is a "Unit" or "Integration" test.
 * @param condition - The DbC contract being exercised.
 *   Use "All" for integration tests that cover Pre + Inv + Post in a single scenario.
 * @param summary - Short human-readable description of what the test asserts.
 */
export function buildRequirementTitle(
  requirementId: string,
  testType: "Unit" | "Integration",
  condition: "Precondition" | "Invariant" | "Postcondition" | "All",
  summary: string
): string {
  return `[${requirementId}][${testType}][${condition}] ${summary}`;
}
