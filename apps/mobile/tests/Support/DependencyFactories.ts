import type { CreateErrorControllerDependencies } from "../../src/Features/Error/CreateErrorController";
import type { CreateErrorObservabilityControllerDependencies } from "../../src/Features/Error/CreateErrorObservabilityController";
import type { CreateUpdateAvailableControllerDependencies } from "../../src/Features/Version/CreateUpdateAvailableController";
import type { CreateVersionCheckControllerDependencies } from "../../src/Features/Version/CreateVersionCheckController";
import type { VersionConfiguration } from "@kanjime/shared";

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

const CURRENT_VERSION = "1.0.0";
const LATEST_VERSION = "1.1.0";
const MINIMUM_SUPPORTED_VERSION = "0.9.0";
const CONFIGURATION_DATE = "2026-05-27T00:00:00.000Z";
const UPDATE_MESSAGE = "A new version is available. You can continue using the application.";
const SAFE_ERROR_MESSAGE = "An unexpected error has occurred. You can continue using the application.";
const REPORT_ID = "error-report-1";

const VERSION_CONFIGURATION: VersionConfiguration = {
  currentVersion: CURRENT_VERSION,
  latestVersion: LATEST_VERSION,
  minimumSupportedVersion: MINIMUM_SUPPORTED_VERSION,
  updatedAt: CONFIGURATION_DATE
};

/**
 * Creates mocked dependencies for version check controller tests.
 */
export function createVersionCheckDependencies(): CreateVersionCheckControllerDependencies {
  return {
    async loadVersionConfiguration(): Promise<VersionConfiguration> {
      return VERSION_CONFIGURATION;
    },
    async loadLastKnownVersionConfiguration(): Promise<VersionConfiguration> {
      return VERSION_CONFIGURATION;
    }
  };
}

/**
 * Creates mocked dependencies for update availability controller tests.
 */
export function createUpdateAvailableDependencies(): CreateUpdateAvailableControllerDependencies {
  return {
    createUpdateMessage(): string {
      return UPDATE_MESSAGE;
    }
  };
}

/**
 * Creates mocked dependencies for controlled error controller tests.
 */
export function createErrorDependencies(): CreateErrorControllerDependencies {
  return {
    createUserFacingMessage(): string {
      return SAFE_ERROR_MESSAGE;
    }
  };
}

/**
 * Creates mocked dependencies for error observability controller tests.
 */
export function createErrorObservabilityDependencies(): CreateErrorObservabilityControllerDependencies {
  return {
    createReportId(): string {
      return REPORT_ID;
    },
    readCurrentDate(): string {
      return CONFIGURATION_DATE;
    }
  };
}
