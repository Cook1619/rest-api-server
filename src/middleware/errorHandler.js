const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Default error
  let error = {
    statusCode: 500,
    message: 'Internal Server Error',
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.statusCode = 400
    error.message = 'Validation Error'
    error.details = Object.values(err.errors).map(e => e.message)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401
    error.message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401
    error.message = 'Token expired'
  }

  // Custom error
  if (err.statusCode) {
    error.statusCode = err.statusCode
    error.message = err.message
  }

  res.status(error.statusCode).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(error.details && { details: error.details }),
  })
}

module.exports = errorHandler
