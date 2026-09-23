// app-backend/routes/auth.js
import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
  checkEmailVerification,
  refreshToken
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTH ROUTES
// ==========================================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Check email verification status
router.get("/check-verification/:email", checkEmailVerification);

// Get current user (protected)
router.get("/me", auth, getCurrentUser);

// Update profile (protected)
router.put("/update-profile", auth, updateProfile);

// Logout
router.post("/logout", auth, logout);

// Refresh token
router.post("/refresh-token", refreshToken);

export default router;