// greenscape-backend/routes/review.route.js
import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import auth from '../middleware/auth.js';  // ✅ FIXED: default import

const router = express.Router();

// ==========================================
// ✅ GET ALL REVIEWS FOR A PRODUCT (Public)
// ==========================================
// ==========================================
// ✅ GET ALL REVIEWS FOR A PRODUCT (Public)
// ==========================================
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    // ✅ Only show APPROVED reviews to public
    const reviews = await Review.find({
      product: productId,
      status: 'approved',
    })
      .populate('user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .lean();

    // Rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      totalRating += r.rating;
    });

    const averageRating = reviews.length
      ? Number((totalRating / reviews.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating,
      breakdown,
      reviews,
    });
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ✅ CHECK IF USER ALREADY REVIEWED (Auth)
// ==========================================
router.get('/can-review/:productId', auth, async (req, res) => {  // ✅ auth
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    // Has the user purchased this product?
    const hasPurchased = await Order.exists({
      user: userId,
      'items.product': productId,
      status: { $in: ['Delivered', 'delivered', 'Completed', 'completed'] },
    });

    res.json({
      success: true,
      hasReviewed: !!existingReview,
      review: existingReview,
      canReview: !existingReview,
      hasPurchased: !!hasPurchased,
    });
  } catch (err) {
    console.error('❌ Error checking review status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ✅ CREATE A REVIEW (Auth)
// ==========================================
router.post('/product/:productId', auth, async (req, res) => {  // ✅ auth
  try {
    const { productId } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Rating and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product',
      });
    }

    // Verified purchase check
    const hasPurchased = await Order.exists({
      user: userId,
      'items.product': productId,
      status: { $in: ['Delivered', 'delivered', 'Completed', 'completed'] },
    });

    const review = await Review.create({
      product: productId,
      user: userId,
      name: req.user.name || req.user.email || 'Anonymous',
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: !!hasPurchased,
    });

    // 🔄 Update product's aggregate rating
    const allReviews = await Review.find({ product: productId }).lean();
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avg.toFixed(1)),
      numReviews: allReviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('❌ Error creating review:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product',
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ✅ UPDATE A REVIEW (Auth)
// ==========================================
router.put('/:reviewId', auth, async (req, res) => {  // ✅ auth
  try {
    const { reviewId } = req.params;
    const { rating, comment, title } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;
    if (title !== undefined) review.title = title;

    await review.save();

    // Recalculate product rating
    const allReviews = await Review.find({ product: review.product }).lean();
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(review.product, {
      rating: Number(avg.toFixed(1)),
      numReviews: allReviews.length,
    });

    res.json({ success: true, review });
  } catch (err) {
    console.error('❌ Error updating review:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ✅ DELETE A REVIEW (Auth)
// ==========================================
router.delete('/:reviewId', auth, async (req, res) => {  // ✅ auth
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate
    const allReviews = await Review.find({ product: productId }).lean();
    const avg = allReviews.length
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;
    await Product.findByIdAndUpdate(productId, {
      rating: Number(avg.toFixed(1)),
      numReviews: allReviews.length,
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('❌ Error deleting review:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// ✅ MARK HELPFUL (Public)
// ==========================================
// ==========================================
// ✅ MARK HELPFUL (Auth — one per user)
// ==========================================
router.put('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Ensure helpfulBy array exists
    if (!Array.isArray(review.helpfulBy)) {
      review.helpfulBy = [];
    }

    // ✅ Check if user already marked it
    const alreadyMarked = review.helpfulBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        error: 'You have already marked this review as helpful',
        alreadyMarked: true,
      });
    }

    // ✅ Add user + update count
    review.helpfulBy.push(userId);
    review.helpful = review.helpfulBy.length;
    await review.save();

    res.json({
      success: true,
      review,
      helpful: review.helpful,
      message: 'Marked as helpful',
    });
  } catch (err) {
    console.error('❌ Error marking helpful:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;