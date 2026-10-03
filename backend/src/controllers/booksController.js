import { searchGoogleBooks } from '../services/googleBooksService.js';

export async function searchBooks(req, res, next) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.status(400).json({ error: 'Enter a keyword to search for books.' });
  if (query.length > 120) return res.status(400).json({ error: 'Search keywords must be 120 characters or fewer.' });
  try {
    res.json({ items: await searchGoogleBooks(query) });
  } catch (error) {
    next(error.status ? error : Object.assign(new Error('Unable to reach Google Books. Check your connection and try again.'), { status: 502 }));
  }
}
