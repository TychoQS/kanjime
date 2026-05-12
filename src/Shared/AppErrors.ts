/**
 * Base application error class.
 * All custom errors should extend this class.
 */
export abstract class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error related to canvas drawing operations.
 */
export class StrokeError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to inference/classification operations.
 */
export class InferenceError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to model loading operations.
 */
export class ModelError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to database/kanji data operations.
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to history operations.
 */
export class HistoryError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to image operations.
 */
export class ImageError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to search operations.
 */
export class SearchError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to application-wide infrastructure (e.g., context, providers).
 */
export class InfrastructureError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to user preferences and settings.
 */
export class PreferenceError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error related to general application information or state.
 */
export class ApplicationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}