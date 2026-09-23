// backend/controllers/categoryController.js
import Category from "../models/Category.js";

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error fetching categories" });
  }
};

// @desc    Create a new category (Admin only)
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json({ success: true, category: savedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};