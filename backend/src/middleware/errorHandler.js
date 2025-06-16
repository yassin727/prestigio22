const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Handle different types of errors
  if (process.env.NODE_ENV === 'production') {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error: don't leak error details
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong'
    });
  }

  // Development error response
  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

module.exports = { errorHandler, AppError }; 