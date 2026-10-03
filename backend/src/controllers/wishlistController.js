import { WishlistBook } from '../models/WishlistBook.js';

const serialize = (book) => ({
  googleBookId: book.googleBookId,
  title: book.title,
  authors: book.authors,
  thumbnail: book.thumbnail,
  rating: book.rating,
  createdAt: book.createdAt,
});

export async function listWishlist(_req, res, next) {
  try {
    const books = await WishlistBook.find().sort({ createdAt: -1 }).lean();
    res.json({ items: books.map(serialize) });
  } catch (error) { next(error); }
}

export async function addWishlist(req, res, next) {
  const { googleBookId, title, authors, thumbnail, rating } = req.body || {};
  if (typeof googleBookId !== 'string' || !googleBookId.trim() || googleBookId.length > 200 || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'A valid Google Books ID and title are required.' });
  }
  if (authors !== undefined && (!Array.isArray(authors) || authors.some((author) => typeof author !== 'string'))) {
    return res.status(400).json({ error: 'Authors must be a list of names.' });
  }
  if (thumbnail !== undefined && (typeof thumbnail !== 'string' || thumbnail.length > 2048)) {
    return res.status(400).json({ error: 'Thumbnail must be a valid URL string.' });
  }
  if (rating !== undefined && rating !== null && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5.' });
  }
  try {
    const id = googleBookId.trim();
    const existing = await WishlistBook.findOne({ googleBookId: id });
    if (existing) return res.status(200).json({ item: serialize(existing), alreadySaved: true });
    const book = await WishlistBook.create({ googleBookId: id, title: title.trim(), authors: authors || [], thumbnail: thumbnail || '', rating: rating ?? null });
    res.status(201).json({ item: serialize(book), alreadySaved: false });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'This book is already in your wishlist.' });
    next(error);
  }
}

export async function removeWishlist(req, res, next) {
  try {
    const deleted = await WishlistBook.findOneAndDelete({ googleBookId: req.params.googleBookId });
    if (!deleted) return res.status(404).json({ error: 'Book not found in wishlist.' });
    res.status(204).end();
  } catch (error) { next(error); }
}
