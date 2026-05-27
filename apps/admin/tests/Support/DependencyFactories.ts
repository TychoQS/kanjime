/**
 * Recorder for sync functions without arguments.
 */
export interface ValueRecorder<TResult> {
  readonly calls: number[];
  readonly handler: () => TResult;
}

/**
 * Creates a recorder for sync functions without arguments.
 */
export function createValueRecorder<TResult>(result: TResult): ValueRecorder<TResult> {
  const calls: number[] = [];

  return {
    calls,
    handler(): TResult {
      calls.push(calls.length + 1);
      return result;
    }
  };
}

/**
 * Recorder for async functions without arguments.
 */
export interface AsyncValueRecorder<TResult> {
  readonly calls: number[];
  readonly handler: () => Promise<TResult>;
}

/**
 * Creates a recorder for async functions without arguments.
 */
export function createAsyncValueRecorder<TResult>(result: TResult): AsyncValueRecorder<TResult> {
  const calls: number[] = [];

  return {
    calls,
    async handler(): Promise<TResult> {
      calls.push(calls.length + 1);
      return result;
    }
  };
}

/**
 * Recorder for async functions receiving a single argument.
 */
export interface AsyncArgumentRecorder<TArgument, TResult> {
  readonly calls: TArgument[];
  readonly handler: (argument: TArgument) => Promise<TResult>;
}

/**
 * Creates a recorder for async functions receiving a single argument.
 */
export function createAsyncArgumentRecorder<TArgument, TResult>(
  result: TResult
): AsyncArgumentRecorder<TArgument, TResult> {
  const calls: TArgument[] = [];

  return {
    calls,
    async handler(argument: TArgument): Promise<TResult> {
      calls.push(argument);
      return result;
    }
  };
}
