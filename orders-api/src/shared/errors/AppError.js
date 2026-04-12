class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, 'CONFLICT', message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

class UnprocessableError extends AppError {
  constructor(message = 'Unprocessable entity', details = null) {
    super(422, 'UNPROCESSABLE', message, details);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'External service unavailable') {
    super(503, 'SERVICE_UNAVAILABLE', message);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ValidationError,
  UnprocessableError,
  ServiceUnavailableError
};