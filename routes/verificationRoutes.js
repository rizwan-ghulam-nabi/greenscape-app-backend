// app-backend/routes/verificationRoutes.js
import express from 'express';
import {
  sendVerificationCode,
  verifyCode,
  resendVerificationCode
} from '../controllers/verificationController.js';

const router = express.Router();

router.post('/send', sendVerificationCode);
router.post('/verify', verifyCode);
router.post('/resend', resendVerificationCode);

export default router;