import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addressRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import emailRoutes from './routes/email.route.js';
import paymentRoutes from './routes/payment.route.js';
import publicBlogRoutes from './routes/publicBlogRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import publicBannerRoutes from './routes/publicBanner.route.js';
import verificationRoutes from './routes/verificationRoutes.js';
import publicDiscountRoutes from './routes/publicDiscount.route.js';
import publicStatsRoutes from './routes/publicStats.route.js';
import reviewRoutes from './routes/review.route.js';
import dns from "dns";

// change DNS 
dns.setServers(["1.1.1.1","8.8.8.8"])

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true                
}));

app.use(express.json());
app.use(cookieParser()); // ✅ CRITICAL: Add this line right here!

// Connect to MongoDB only once
await connectDB();

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/email', emailRoutes);
app.use('/blog', publicBlogRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/banners', publicBannerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/discounts', publicDiscountRoutes); 
app.use('/api/public/stats', publicStatsRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});