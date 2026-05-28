import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

dotenv.config();
connectDB();

const app = express();

// ─── CORS (must come BEFORE helmet) ───────────────────────────────────────────
// On Android / mobile networks the browser sends an OPTIONS preflight.
// If helmet runs first its Cross-Origin-Resource-Policy header can block the
// preflight before CORS has a chance to set the correct allow-origin headers.
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];
const configuredAllowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(',') : [])
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, '')); // strip trailing slashes
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // 200 instead of 204 — some legacy Android browsers treat 204 as an error
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Explicitly handle all OPTIONS preflight requests so they resolve before
// any auth middleware can reject them with 401
app.options('*', cors(corsOptions));

// ─── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet({
  // 'same-origin' would block Cloudinary CDN images and cross-origin API calls
  // from Android WebView — set to 'cross-origin' to allow them
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── Body parsers ──────────────────────────────────────────────────────────────
// Raw body for Razorpay webhook signature verification (must come before express.json)
app.use('/api/payment/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────────────────────
// Ping this every 14 min to prevent Render free-tier cold starts
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
