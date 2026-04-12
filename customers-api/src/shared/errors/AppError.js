class AppError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message, details) {
    super(404, 'NOT_FOUND', message || 'Resource not found', details);
  }
}

class ConflictError extends AppError {
  constructor(message, details) {
    super(409, 'CONFLICT', message || 'Resource conflict', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message, details) {
    super(401, 'UNAUTHORIZED', message || 'Unauthorized', details);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(400, 'VALIDATION_ERROR', message || 'Validation failed', details);
  }
}

class ForbiddenError extends AppError {
  constructor(message, details) {
    super(403, 'FORBIDDEN', message || 'Forbidden', details);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ValidationError,
  ForbiddenError
};
