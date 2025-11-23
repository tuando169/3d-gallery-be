import createError from 'http-errors';

export const notFound = (_req, _res, next) => {
  next(createError(404, 'Route not found'));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    error: { message: err.message || 'Internal Server Error' }
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.error.stack = err.stack;
  }
  res.status(status).json(payload);
};
