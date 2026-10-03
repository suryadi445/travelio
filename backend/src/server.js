import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config.js';

try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  app.listen(config.port, '0.0.0.0', () => {
    if (config.nodeEnv !== 'production') process.stdout.write(`Bookhaven API listening on ${config.port}\n`);
  });
} catch (error) {
  process.stderr.write(`Database connection failed: ${error.message}\n`);
  process.exit(1);
}
