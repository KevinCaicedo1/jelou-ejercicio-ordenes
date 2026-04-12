const { ValidationError } = require('../../shared/errors/AppError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new ValidationError('Validation failed', {
          issues: result.error.issues,
          source
        })
      );
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = { validate };
