/**
 * Builds a consistent test title containing requirement metadata.
 *
 * @param requirementId - The requirement or scenario identifier.
 * @param testType - Whether this is a unit or integration test.
 * @param condition - The DbC contract being exercised.
 * @param summary - Short human-readable description of what the test asserts.
 */
export function buildRequirementTitle(
  requirementId: string,
  testType: "Unit" | "Integration" | "Regression",
  condition: "Precondition" | "Invariant" | "Postcondition" | "All",
  summary: string
): string {
  return `[${requirementId}][${testType}][${condition}] ${summary}`;
}
