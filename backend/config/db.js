import mongoose from 'mongoose';

/**
 * Serverless-safe MongoDB connection with caching.
 *
 * In a long-running server (Render, Railway) mongoose.connect() is called once
 * at boot. On Vercel, every cold-start re-imports this module, so without
 * caching we'd open a new connection on every request and exhaust the Atlas
 * connection pool quickly.
 *
 * The fix: check readyState before connecting.
 *   0 = disconnected  → connect
 *   1 = connected     → reuse (skip connect)
 *   2 = connecting    → skip (let the pending connect finish)
 *   3 = disconnecting → skip
 */
const connectDB = async () => {
  // Reuse an existing connection if one is already open or being opened
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Do NOT call process.exit() in a serverless function — it terminates the
    // entire Lambda/function instance and causes cryptic 500s.
    // Throwing lets the caller catch the error and return a proper response.
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;