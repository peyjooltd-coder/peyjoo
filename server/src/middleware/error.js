export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.path })
}

export function errorHandler(err, req, res, next) {
  console.error(err)
  if (res.headersSent) return next(err)
  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  })
}
