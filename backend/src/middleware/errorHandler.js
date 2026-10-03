import { config } from '../config.js';

export function notFound(_req, res) {
  res.status(404).json({ error: 'Endpoint not found.' });
}

export function errorHandler(error, _req, res, _next) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (config.nodeEnv !== 'production') console.error(error.message);
  const safeMessage = status === 502
    ? error.message
    : status >= 500 && config.nodeEnv === 'production'
      ? 'Something went wrong. Please try again.'
      : error.message || 'Something went wrong.';
  res.status(status).json({ error: safeMessage });
}
