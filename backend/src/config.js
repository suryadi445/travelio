import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookhaven',
  googleBooksApiUrl: process.env.GOOGLE_BOOKS_API_URL || 'https://www.googleapis.com/books/v1/volumes',
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY?.trim() || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
