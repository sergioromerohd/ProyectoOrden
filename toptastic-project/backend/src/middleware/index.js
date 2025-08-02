// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path}`);
  next();
};

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Si ya se envió la respuesta, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
};

module.exports = {
  requestLogger,
  errorHandler,
  notFound
};
