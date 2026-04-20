/**
 * Builds a consistent test title containing requirement metadata.
 */
export function buildRequirementTitle(
  requirementId: string,
  testType: "Unit" | "Integration",
  condition: "Precondition" | "Invariant" | "Postcondition",
  summary: string
): string {
  return `[${requirementId}][${testType}][${condition}] ${summary}`;
}
