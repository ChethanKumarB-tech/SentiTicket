const { ZodError } = require('zod');
const AppError = require('../utils/appError');

function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        return next(AppError.unprocessable('Request validation failed', 'VALIDATION_ERROR', details));
      }
      return next(error);
    }
  };
}

module.exports = validate;
