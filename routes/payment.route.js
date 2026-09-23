import express from 'express';
import { processJazzCashPayment } from '../utils/jazzcash.js';

const router = express.Router();

// ==========================================
// ✅ PROCESS PAYMENT
// ==========================================
router.post('/process-payment', async (req, res) => {
  try {
    const orderDetails = req.body;
    
    // Validate required fields
    if (!orderDetails.amount || !orderDetails.orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and orderId are required',
      });
    }

    // Process JazzCash payment
    const paymentResult = await processJazzCashPayment(orderDetails);

    if (paymentResult.success) {
      return res.status(200).json({
        success: true,
        transactionId: paymentResult.transactionId,
        message: 'Payment successful',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paymentResult.error,
      });
    }

  } catch (error) {
    console.error('❌ Payment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed',
    });
  }
});

// ==========================================
// ✅ VERIFY PAYMENT
// ==========================================
router.post('/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
      });
    }

    // Verify payment status
    const verificationResult = await verifyJazzCashPayment(transactionId);

    return res.status(200).json({
      success: true,
      data: verificationResult,
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed',
    });
  }
});

export default router;