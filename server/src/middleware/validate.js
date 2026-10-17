
import { z } from 'zod';

// Friendlier default messages for every schema in the project.
// A message written inside a schema, e.g. z.email('Enter a valid email'), always wins over these.
z.config({
  customError: (issue) => {
    if (issue.code === 'invalid_type') {
      return issue.input === undefined
        ? 'This field is required'
        : `Must be a valid ${issue.expected}`;
    }
    // Returning nothing keeps Zod's own message for all other cases.
  },
});

export const validate = (schemas) => (req, res, next) => {
  try {
    req.valid = {};
    // "?? {}" so an empty request reports each missing field instead of one vague error
    if (schemas.body) req.valid.body = schemas.body.parse(req.body ?? {});
    if (schemas.query) req.valid.query = schemas.query.parse(req.query);
    if (schemas.params) req.valid.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    next(err); // errorHandler turns ZodError into a 400 response
  }
};