const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { UnauthorizedError } = require('../../shared/errors/AppError');

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload;
    return next();
  } catch (_error) {
    return next(new UnauthorizedError('Invalid token'));
  }
}

module.exports = { authenticate };