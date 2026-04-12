const { ValidationError } = require('../../shared/errors/AppError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return next(
        new ValidationError('Validation failed', {
          issues: parsed.error.issues
        })
      );
    }
    req[source] = parsed.data;
    return next();
  };
}

module.exports = { validate };