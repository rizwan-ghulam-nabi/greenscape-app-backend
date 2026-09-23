// greenscape-backend/routes/publicStats.route.js
import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// ==========================================
// ✅ GET PUBLIC STATS
// ==========================================
router.get('/', async (req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalCities,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      // Get unique cities from orders
      Order.distinct('shippingAddress.city').then(cities => cities.length),
    ]);

    // Calculate average rating (if you have reviews)
    // For now, default to 4.9
    const avgRating = 4.9;

    res.json({
      success: true,
      stats: {
        products: totalProducts,
        customers: totalCustomers,
        orders: totalOrders,
        cities: totalCities,
        rating: avgRating,
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      stats: {
        products: 0,
        customers: 0,
        orders: 0,
        cities: 0,
        rating: 0,
      }
    });
  }
});

export default router;