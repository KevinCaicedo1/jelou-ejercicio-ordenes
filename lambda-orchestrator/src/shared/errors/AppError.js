class AppError extends Error {
  constructor(statusCode, code, message, step = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.step = step;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found', step = null) {
    super(404, 'NOT_FOUND', message, step);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', step = 'validate_input') {
    super(400, 'VALIDATION_ERROR', message, step);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict', step = null) {
    super(409, 'CONFLICT', message, step);
  }
}

class UnprocessableError extends AppError {
  constructor(message = 'Unprocessable', step = null) {
    super(422, 'UNPROCESSABLE', message, step);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', step = null) {
    super(503, 'SERVICE_UNAVAILABLE', message, step);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnprocessableError,
  ServiceUnavailableError
};
