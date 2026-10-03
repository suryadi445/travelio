import { config } from '../config.js';

export function normalizeBook(volume) {
  const info = volume?.volumeInfo || {};
  return {
    googleBookId: volume?.id || '',
    title: info.title?.trim() || 'Untitled book',
    authors: Array.isArray(info.authors) ? info.authors.filter((author) => typeof author === 'string') : [],
    thumbnail: info.imageLinks?.thumbnail?.replace(/^http:/, 'https:') || info.imageLinks?.smallThumbnail?.replace(/^http:/, 'https:') || '',
    rating: typeof info.averageRating === 'number' ? Math.min(5, Math.max(0, info.averageRating)) : null,
  };
}

export function buildGoogleBooksUrl(query, apiKey = config.googleBooksApiKey) {
  const url = new URL(config.googleBooksApiUrl);
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', '30');
  if (apiKey) url.searchParams.set('key', apiKey);
  return url;
}

export function googleBooksFailureMessage(status, payload = {}) {
  const upstreamError = payload?.error || {};
  const reasons = Array.isArray(upstreamError.errors)
    ? upstreamError.errors.map((item) => item?.reason || '').join(' ').toLowerCase()
    : '';
  const message = typeof upstreamError.message === 'string' ? upstreamError.message.toLowerCase() : '';
  const quotaFailure = status === 429 || /quota|rate.?limit|daily.?limit/.test(`${reasons} ${message}`);

  if (quotaFailure) return 'Google Books quota was exceeded. Check the Google Cloud project quota and API key, then try again.';
  if (status === 401 || status === 403 || /api key.*(invalid|not valid|not found)/.test(message)) {
    return 'Google Books rejected access. Check GOOGLE_BOOKS_API_KEY and confirm the Books API is enabled in its Google Cloud project.';
  }
  if (status === 404) return 'Google Books endpoint was not found. Check GOOGLE_BOOKS_API_URL.';
  return 'Google Books is temporarily unavailable. Please try again.';
}

export async function searchGoogleBooks(query) {
  const url = buildGoogleBooksUrl(query);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    let payload = {};
    try { payload = await response.json(); } catch { /* Upstream may return an empty or non-JSON error body. */ }
    const reason = payload?.error?.errors?.[0]?.reason;
    if (config.nodeEnv === 'production') {
      process.stderr.write(`Google Books API returned HTTP ${response.status}${reason ? ` (${reason})` : ''}.\n`);
    }
    const error = new Error(googleBooksFailureMessage(response.status, payload));
    error.status = 502;
    error.upstreamStatus = response.status;
    throw error;
  }
  const data = await response.json();
  return (Array.isArray(data.items) ? data.items : []).map(normalizeBook).filter((book) => book.googleBookId);
}
