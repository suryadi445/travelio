import mongoose from 'mongoose';

const wishlistBookSchema = new mongoose.Schema({
  googleBookId: { type: String, required: true, unique: true, trim: true, index: true },
  title: { type: String, required: true, trim: true },
  authors: { type: [String], default: [] },
  thumbnail: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const WishlistBook = mongoose.model('WishlistBook', wishlistBookSchema);
