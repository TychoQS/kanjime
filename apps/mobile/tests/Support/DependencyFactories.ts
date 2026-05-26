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

/**
 * Recorder for async functions receiving a tuple of arguments.
 */
export interface AsyncTupleRecorder<TArguments extends unknown[], TResult> {
  readonly calls: TArguments[];
  readonly handler: (...arguments_: TArguments) => Promise<TResult>;
}

/**
 * Creates a recorder for async functions receiving a tuple of arguments.
 */
export function createAsyncTupleRecorder<TArguments extends unknown[], TResult>(
  result: TResult
): AsyncTupleRecorder<TArguments, TResult> {
  const calls: TArguments[] = [];

  return {
    calls,
    async handler(...arguments_: TArguments): Promise<TResult> {
      calls.push(arguments_);
      return result;
    }
  };
}

/**
 * Recorder for async procedures receiving a single argument.
 */
export interface VoidArgumentRecorder<TArgument> {
  readonly calls: TArgument[];
  readonly handler: (argument: TArgument) => Promise<void>;
}

/**
 * Creates a recorder for async procedures receiving a single argument.
 */
export function createVoidArgumentRecorder<TArgument>(): VoidArgumentRecorder<TArgument> {
  const calls: TArgument[] = [];

  return {
    calls,
    async handler(argument: TArgument): Promise<void> {
      calls.push(argument);
    }
  };
}

/**
 * Recorder for async procedures receiving a tuple of arguments.
 */
export interface VoidTupleRecorder<TArguments extends unknown[]> {
  readonly calls: TArguments[];
  readonly handler: (...arguments_: TArguments) => Promise<void>;
}

/**
 * Creates a recorder for async procedures receiving a tuple of arguments.
 */
export function createVoidTupleRecorder<TArguments extends unknown[]>(): VoidTupleRecorder<TArguments> {
  const calls: TArguments[] = [];

  return {
    calls,
    async handler(...arguments_: TArguments): Promise<void> {
      calls.push(arguments_);
    }
  };
}
