const { env } = require('../../config/env');
const { UnauthorizedError } = require('../../shared/errors/AppError');

function authenticateServiceToken(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing service token'));
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!env.serviceToken || token !== env.serviceToken) {
    return next(new UnauthorizedError('Invalid service token'));
  }

  return next();
}

module.exports = { authenticateServiceToken };
