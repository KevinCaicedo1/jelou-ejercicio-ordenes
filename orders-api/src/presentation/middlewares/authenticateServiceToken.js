const { env } = require('../../config/env');
const { UnauthorizedError } = require('../../shared/errors/AppError');

function authenticateServiceToken(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token || token !== env.serviceToken) {
    return next(new UnauthorizedError('Invalid service token'));
  }

  return next();
}

module.exports = { authenticateServiceToken };