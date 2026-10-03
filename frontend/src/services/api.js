const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const API_BASE = configuredApiUrl
  ? `${configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`}`
  : '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('We could not reach Bookhaven. Check your connection and try again.');
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Something went wrong. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}

export const searchBooks = (query, signal) => request(`/books/search?q=${encodeURIComponent(query)}`, { signal });
export const getWishlist = () => request('/wishlist');
export const addWishlist = (book) => request('/wishlist', { method: 'POST', body: JSON.stringify(book) });
export const removeWishlist = (id) => request(`/wishlist/${encodeURIComponent(id)}`, { method: 'DELETE' });
