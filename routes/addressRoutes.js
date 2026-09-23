import express from "express";
import auth from "../middleware/auth.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// ==========================================
// 1. GET ALL ADDRESSES
// ==========================================
router.get("/", getAddresses);

// ==========================================
// 2. CREATE ADDRESS
// ==========================================
router.post("/", createAddress);

// ==========================================
// 3. UPDATE ADDRESS
// ==========================================
router.put("/:id", updateAddress);

// ==========================================
// 4. DELETE ADDRESS
// ==========================================
router.delete("/:id", deleteAddress);

// ==========================================
// 5. SET DEFAULT ADDRESS
// ==========================================
router.put("/:id/default", setDefaultAddress);

export default router;