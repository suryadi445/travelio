import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { searchBooks } from './controllers/booksController.js';
import { addWishlist, listWishlist, removeWishlist } from './controllers/wishlistController.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();
app.disable('x-powered-by');
const corsOrigin = config.corsOrigin.trim() === '*'
  ? '*'
  : config.corsOrigin.split(',').map((origin) => origin.trim());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/books/search', searchBooks);
app.get('/api/wishlist', listWishlist);
app.post('/api/wishlist', addWishlist);
app.delete('/api/wishlist/:googleBookId', removeWishlist);
app.use(notFound);
app.use(errorHandler);
