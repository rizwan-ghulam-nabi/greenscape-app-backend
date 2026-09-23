import express from "express";
import Order from "../models/Order.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// HELPER: Check if user has any previous non-cancelled orders
// ==========================================
const isFirstOrder = async (userId) => {
  try {
    const existingOrder = await Order.findOne({ 
      user: userId,
      orderStatus: { $ne: 'cancelled' } // Don't count cancelled orders
    });
    return !existingOrder; // Returns true if no previous non-cancelled orders
  } catch (error) {
    console.error("Error checking first order:", error);
    return false;
  }
};

// ==========================================
// 1. CREATE ORDER (Protected)
// ==========================================
router.post("/", auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal } = req.body;

    // Calculate subtotal from items if not provided
    const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check if this is the customer's first order
    const firstOrder = await isFirstOrder(req.user.id);

    // Define delivery charges
    const STANDARD_DELIVERY_CHARGE = 500; // Rs. 500
    const deliveryCharge = firstOrder ? 0 : STANDARD_DELIVERY_CHARGE;

    // Calculate total
    const totalAmount = calculatedSubtotal + deliveryCharge;

    // Generate order number
    const orderNumber = `GS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      totalAmount,
      isFirstOrder: firstOrder,
      freeDeliveryApplied: firstOrder,
      orderNumber,
      
      // Add initial status history
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        note: firstOrder 
          ? 'Order placed - First order free delivery applied 🎉' 
          : 'Order placed'
      }]
    });

    await order.save();

    res.status(201).json({
      success: true,
      order,
      message: firstOrder 
        ? 'Congratulations! Your first order gets FREE delivery!' 
        : 'Order placed successfully'
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. GET USER ORDERS (Protected)
// ==========================================
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GET SINGLE ORDER (Protected)
// ==========================================
router.get("/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name image')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CHECK FIRST ORDER ELIGIBILITY (Protected)
// ==========================================
router.get("/check-first-order", auth, async (req, res) => {
  try {
    const firstOrder = await isFirstOrder(req.user.id);
    
    res.json({ 
      isFirstOrder: firstOrder,
      deliveryCharge: firstOrder ? 0 : 500,
      message: firstOrder ? 'You get FREE delivery on your first order!' : 'Standard delivery charges apply'
    });
  } catch (err) {
    console.error("Error checking first order:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;