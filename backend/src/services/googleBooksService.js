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

export async function searchGoogleBooks(query) {
  const url = buildGoogleBooksUrl(query);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    const error = new Error('Google Books is temporarily unavailable. Please try again.');
    error.status = 502;
    throw error;
  }
  const data = await response.json();
  return (Array.isArray(data.items) ? data.items : []).map(normalizeBook).filter((book) => book.googleBookId);
}
