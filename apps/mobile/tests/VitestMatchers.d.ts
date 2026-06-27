import "vitest";

declare module "vitest" {
  interface Assertion<T = any> {
    toBe(expected: T, message?: string): void;
    toEqual(expected: unknown, message?: string): void;
    toContainEqual(expected: unknown, message?: string): void;
    toHaveLength(expected: number, message?: string): void;
    toBeGreaterThan(expected: number | bigint, message?: string): void;
    toBeLessThanOrEqual(expected: number | bigint, message?: string): void;
    toBeNull(message?: string): void;
    toBeInTheDocument(message?: string): void;
  }
}
