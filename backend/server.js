import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './config/db.js';
import { ensureSystemPages } from './controllers/pageController.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  await connectDB();
  await ensureSystemPages().catch((err) =>
    console.error('Could not seed system pages (DB likely unavailable):', err.message)
  );
};

start();
