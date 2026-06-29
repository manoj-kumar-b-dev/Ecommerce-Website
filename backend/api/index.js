/**
 * api/index.js — Vercel Serverless Entry Point
 *
 * Vercel routes ALL incoming HTTP requests to this file.
 * The vercel.json rewrites rule sends every path (/**) here.
 *
 * How it works:
 *  1. connectDB() is called before each handler invocation.
 *     - If a connection already exists (warm instance), connectDB() returns
 *       immediately without opening another connection.
 *     - If this is a cold start, it opens a fresh connection.
 *  2. The Express `app` from server.js is exported as the default export.
 *     Vercel's runtime detects it is an Express app and calls it as a
 *     standard Node.js (req, res) handler — no extra adapters needed.
 *
 * Local development note:
 *  This file does NOT call app.listen(). For local dev, use:
 *    nodemon server.js        (keep a separate local-only listen block there)
 *  Or add back a listen call in a local-only script.
 */

import connectDB from '../config/db.js';
import app from '../server.js';

// Ensure DB is connected before the request is handled.
// connectDB() is idempotent — safe to call on every request.
await connectDB();

export default app;
