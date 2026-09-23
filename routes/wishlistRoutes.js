// backend/routes/wishlistRoutes.js
import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product');

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        items: []
      });
    }

    // Filter out null products (deleted products)
    const items = wishlist.items
      .filter(item => item.product)
      .map(item => ({
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        originalPrice: item.product.originalPrice,
        images: item.product.images,
        category: item.product.category,
        rating: item.product.rating,
        reviews: item.product.reviews,
        stock: item.product.stock,
        discountPercentage: item.product.discountPercentage,
        addedAt: item.addedAt
      }));

    res.status(200).json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Add to wishlist
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        items: []
      });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    wishlist.items.push({
      product: productId,
      addedAt: new Date()
    });

    await wishlist.save();

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    // Remove item
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Clear wishlist
router.delete('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (err) {
    console.error('Error clearing wishlist:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;