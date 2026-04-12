const { AppError } = require('../errors/AppError');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
};

function success(statusCode, data, correlationId = null) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({
      success: true,
      correlationId,
      data
    })
  };
}

function error(statusCode, code, message, step = null, correlationId = null) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({
      success: false,
      correlationId,
      error: {
        code,
        message,
        step
      }
    })
  };
}

function fromAppError(err, correlationId = null) {
  if (err instanceof AppError) {
    return error(err.statusCode, err.code, err.message, err.step, correlationId);
  }

  return error(500, 'INTERNAL_ERROR', 'Internal server error', null, correlationId);
}

module.exports = {
  HEADERS,
  success,
  error,
  fromAppError
};
