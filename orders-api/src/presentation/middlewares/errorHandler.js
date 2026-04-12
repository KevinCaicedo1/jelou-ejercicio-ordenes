const { AppError } = require('../../shared/errors/AppError');

function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || undefined
      }
    });
  }

  console.error('Unhandled error:', {
    message: error?.message,
    code: error?.code,
    stack: error?.stack
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error'
    }
  });
}

module.exports = { errorHandler };