/**
 * dev.js — Local Development Entry Point
 *
 * This file is for LOCAL DEVELOPMENT ONLY. It is NOT deployed to Vercel.
 *
 * Vercel uses api/index.js as its serverless handler (no listen() needed).
 * This file provides the listen() call for running locally.
 *
 * Usage:
 *   npm run dev    → nodemon dev.js
 *   npm start      → node dev.js (local production-like run)
 */

import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import app from './server.js';

await connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Local] Server running at http://localhost:${PORT}`);
});
