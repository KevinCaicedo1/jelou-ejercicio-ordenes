const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { UnauthorizedError } = require('../../shared/errors/AppError');

function authenticate(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing bearer token'));
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload;
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid token'));
  }
}

module.exports = { authenticate };
