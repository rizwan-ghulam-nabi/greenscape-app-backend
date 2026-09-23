// backend/routes/publicBanner.route.js
import express from 'express';
import Banner from '../models/Banner.js';

const router = express.Router();

// ==========================================
// GET ACTIVE BANNERS (Public - No Auth)
// ==========================================
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    
    const banners = await Banner.find({ 
      isActive: true,
      // Banner hasn't ended (if endDate exists)
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gt: now } }
      ],
      // Banner has started (if startDate exists)
      $and: [
        { $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } }
        ]}
      ]
    })
    .sort({ order: 1 })
    .populate('categoryId', 'name slug')
    .populate('productId', 'name slug image');

    res.json({ success: true, banners });
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GET ACTIVE BANNERS BY PAGE (Public - No Auth)
// ==========================================
router.get('/by-page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const now = new Date();
    
    // Validate page parameter
    const validPages = ['home', 'shop', 'category', 'product'];
    if (!validPages.includes(page)) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }

    const banners = await Banner.find({ 
      isActive: true,
      [`showOnPages.${page}`]: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gt: now } }
      ]
    })
    .sort({ order: 1 })
    .populate('categoryId', 'name slug')
    .populate('productId', 'name slug image');

    res.json({ success: true, banners });
  } catch (err) {
    console.error('Error fetching banners:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GET SINGLE BANNER (Public - No Auth)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('categoryId', 'name slug')
      .populate('productId', 'name slug image');
    
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;