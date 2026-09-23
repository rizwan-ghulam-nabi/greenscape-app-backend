// app-backend/routes/categoryRoutes.js
import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// ✅ GET ALL CATEGORIES (Public)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;