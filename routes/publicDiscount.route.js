// greenscape-backend/routes/publicDiscount.route.js
import express from 'express';
import mongoose from 'mongoose';
import Discount from '../models/Discount.js';
import Product from '../models/Product.js';

const router = express.Router();

// ==========================================
// ✅ GET ALL ACTIVE DISCOUNTS (Public)
// ==========================================
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('name description code type value appliesTo products categories badgeText image endDate minPurchase')
      .sort({ value: -1 });

    res.json({ success: true, discounts });
  } catch (err) {
    console.error('Error fetching active discounts:', err);
    res.status(500).json({ success: false, error: err.message, discounts: [] });
  }
});

// ==========================================
// ✅ GET DISCOUNT FOR A SPECIFIC PRODUCT
// ==========================================
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const now = new Date();

    console.log('🎯 [Discount API] Product:', productId);

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('❌ Invalid ObjectId:', productId);
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        hasDiscount: false,
        discount: null,
        originalPrice: 0,
        finalPrice: 0,
        savings: 0,
      });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found',
        hasDiscount: false,
        discount: null,
      });
    }

    console.log('✅ Product:', product.name);

    // ✅ Find active discounts — CATEGORY FILTER REMOVED
    const discounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { appliesTo: 'all_products' },
        { appliesTo: 'new_arrivals' },
        { appliesTo: 'specific_products', products: productId },
      ],
    });

    console.log('📦 Discounts found:', discounts.length);

    if (discounts.length === 0) {
      return res.json({
        success: true,
        hasDiscount: false,
        discount: null,
        originalPrice: product.price,
        finalPrice: product.price,
        savings: 0,
      });
    }

    // Find best discount
    let bestDiscount = null;
    let maxSavings = 0;
    let finalPrice = product.price;

    for (const d of discounts) {
      let savings = 0;
      if (d.type === 'percentage') {
        savings = (product.price * d.value) / 100;
      } else {
        savings = d.value;
      }

      if (savings > maxSavings) {
        maxSavings = savings;
        bestDiscount = d;
        finalPrice = Math.max(0, product.price - savings);
      }
    }

    if (maxSavings > product.price) {
      maxSavings = product.price;
      finalPrice = 0;
    }

    console.log('✅ Best discount:', bestDiscount.name);

    res.json({
      success: true,
      hasDiscount: true,
      discount: {
        id: bestDiscount._id,
        name: bestDiscount.name,
        code: bestDiscount.code,
        type: bestDiscount.type,
        value: bestDiscount.value,
        badgeText: bestDiscount.badgeText || (
          bestDiscount.type === 'percentage' 
            ? `${bestDiscount.value}% OFF` 
            : `Rs. ${bestDiscount.value} OFF`
        ),
        endDate: bestDiscount.endDate,
        minPurchase: bestDiscount.minPurchase,
      },
      originalPrice: product.price,
      finalPrice: Math.round(finalPrice),
      savings: Math.round(maxSavings),
      savingsPercentage: Math.round((maxSavings / product.price) * 100),
    });
  } catch (err) {
    console.error('❌ Error fetching product discount:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      hasDiscount: false,
      discount: null,
    });
  }
});

// ==========================================
// ✅ VALIDATE DISCOUNT CODE (At Checkout)
// ==========================================
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Discount code is required' 
      });
    }

    const discount = await Discount.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid discount code' 
      });
    }

    const now = new Date();

    if (now < discount.startDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Discount is not yet active' 
      });
    }

    if (now > discount.endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Discount has expired' 
      });
    }

    if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ 
        success: false, 
        error: 'Discount usage limit reached' 
      });
    }

    if (cartTotal < discount.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        error: `Minimum purchase of Rs. ${discount.minPurchase} required` 
      });
    }

    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cartTotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    res.json({
      success: true,
      valid: true,
      discount: {
        id: discount._id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountAmount),
        badgeText: discount.badgeText,
        minPurchase: discount.minPurchase,
      }
    });
  } catch (err) {
    console.error('❌ Error validating discount:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;