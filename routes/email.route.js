import express from 'express';
import { sendOrderEmail, sendTestEmail } from '../utils/customEmailSender.js';

const router = express.Router();

// ==========================================
// ✅ SEND ORDER CONFIRMATION EMAIL
// ==========================================
router.post('/send-order-email', async (req, res) => {
  try {
    const orderDetails = req.body;

    if (!orderDetails.customerEmail || !orderDetails.orderId) {
      return res.status(400).json({
        success: false,
        message: 'Customer email and order ID are required',
      });
    }

    const emailResult = await sendOrderEmail(orderDetails);

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Order email sent successfully',
        emailId: emailResult.id,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: emailResult.error,
      });
    }

  } catch (error) {
    console.error('❌ Email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ==========================================
// ✅ SEND TEST EMAIL
// ==========================================
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailResult = await sendTestEmail(email);

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        emailId: emailResult.id,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: emailResult.error,
      });
    }

  } catch (error) {
    console.error('❌ Test email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;