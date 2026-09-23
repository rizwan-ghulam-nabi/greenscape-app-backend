// e-commerce-backend/routes/publicBlogRoutes.js
import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

// Get all published posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const filter = { status: 'Published' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      posts: []
    });
  }
});

// ✅ NEW: Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'Published' });
    
    // Get count for each category
    const categoryCounts = await Blog.aggregate([
      { $match: { status: 'Published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoriesWithCount = categories.map(cat => ({
      name: cat,
      count: categoryCounts.find(c => c._id === cat)?.count || 0
    }));

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      categories: []
    });
  }
});

// Get popular posts
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const posts = await Blog.find({ status: 'Published' })
      .select('title slug excerpt image views createdAt')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      posts
    });
  } catch (err) {
    console.error('Error fetching popular posts:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get single post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, status: 'Published' })
      .populate('author', 'firstName lastName');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get related posts
router.get('/related/:id', async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const relatedPosts = await Blog.find({
      _id: { $ne: post._id },
      category: post.category,
      status: 'Published'
    })
      .select('title slug excerpt image views createdAt')
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts: relatedPosts
    });
  } catch (err) {
    console.error('Error fetching related posts:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 9 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;
    const searchRegex = new RegExp(q, 'i');

    const filter = {
      $or: [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ],
      status: 'Published'
    };

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .select('title slug excerpt image category views createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;