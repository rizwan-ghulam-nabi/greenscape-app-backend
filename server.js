import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dns from 'dns';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import addressRoutes from './routes/addressRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import emailRoutes from './routes/email.route.js';
import paymentRoutes from './routes/payment.route.js';
import publicBlogRoutes from './routes/publicBlogRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import publicBannerRoutes from './routes/publicBanner.route.js';
import verificationRoutes from './routes/verificationRoutes.js';
import publicDiscountRoutes from './routes/publicDiscount.route.js';
import publicStatsRoutes from './routes/publicStats.route.js';
import reviewRoutes from './routes/review.route.js';

// ✅ Load env — Vercel uses dashboard, so only load .env files in dev
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

const app = express();
app.set('trust proxy', 1);

// ✅ CORS — env-driven for both dev and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ALT,
].filter(Boolean);

console.log('🔓 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl, mobile apps, server-to-server
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.warn('🚫 CORS blocked:', origin);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ Per-request Mongo guard (replaces top-level await connectDB())
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/health') return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Database unavailable',
      details: err.message,
    });
  }
});

// ✅ Health check
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, db: 'connected', env: process.env.NODE_ENV, time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'disconnected', error: err.message });
  }
});

// ==========================================
// ✅ ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/email', emailRoutes);
// app.use('/blog', publicBlogRoutes);
app.use('/api/blog', publicBlogRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/banners', publicBannerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/discounts', publicDiscountRoutes);
app.use('/api/public/stats', publicStatsRoutes);
app.use('/api/reviews', reviewRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// ✅ Local dev only — listen on a port
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ✅ Export for Vercel serverless
export default app;