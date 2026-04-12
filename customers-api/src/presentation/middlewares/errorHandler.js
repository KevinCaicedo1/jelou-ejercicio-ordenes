const { AppError } = require('../../shared/errors/AppError');
const { error: buildError } = require('../../shared/utils/responseBuilder');

function errorHandler(err, _req, res, _next) {

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(buildError(err.code, err.message, err.details || {}));
  }

  console.error(err);
  return res.status(500).json(buildError('INTERNAL_ERROR', 'Internal server error', {}));
}

module.exports = { errorHandler };
