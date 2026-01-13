const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) { // eslint-disable-line
  if (err instanceof ApiError) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(err.statusCode).json({ status: 'error', message: err.message, details: err.details });
  }
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // Log full error for debugging in development
  // eslint-disable-next-line no-console
  console.error(err.stack || err);
  const payload = { status: 'error', message };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(payload);
}

module.exports = errorHandler;
