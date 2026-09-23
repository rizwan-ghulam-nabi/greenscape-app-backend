// app-backend/controllers/verificationController.js
import VerificationCode from '../models/VerificationCode.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

export const sendVerificationCode = async (req, res) => {
  try {
    const { email, type = 'register' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    await VerificationCode.findOneAndUpdate(
      { email },
      { code, type, expiresAt, verified: false, attempts: 0 },
      { upsert: true, new: true }
    );
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9f6; padding: 20px;">
        <div style="background: #2B7A4B; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🌿 GreenScape</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0;">Grow. Nurture. Thrive.</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2B7A4B; margin-top: 0;">📧 Verify Your Email</h2>
          
          <p style="color: #333; line-height: 1.6;">Dear Customer,</p>
          <p style="color: #333; line-height: 1.6;">Thank you for registering with GreenScape! Please use the verification code below to verify your email address.</p>
          
          <div style="background: #f8f9f6; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="font-size: 48px; letter-spacing: 10px; color: #2B7A4B; margin: 0;">${code}</h2>
            <p style="color: #666; margin-top: 10px;">This code will expire in 15 minutes</p>
          </div>
          
          <p style="color: #666;">If you didn't create an account with GreenScape, please ignore this email.</p>
          
          <p style="color: #666; margin-top: 20px;">If you have any questions, contact us at support@greenscape.com</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2026 GreenScape. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const emailResult = await sendEmail(email, 'Verify Your Email - GreenScape', html);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (err) {
    console.error('Error sending verification code:', err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    
    const verification = await VerificationCode.findOne({ email });
    
    if (!verification) {
      return res.status(404).json({ error: 'Verification code not found' });
    }
    
    if (verification.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    if (verification.attempts >= 5) {
      return res.status(400).json({ error: 'Too many attempts. Request a new code.' });
    }
    
    if (verification.code !== code) {
      verification.attempts += 1;
      await verification.save();
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    verification.verified = true;
    await verification.save();
    
    await User.findOneAndUpdate(
      { email },
      { emailVerified: true }
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('Error verifying code:', err);
    res.status(500).json({ error: err.message });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    await VerificationCode.findOneAndUpdate(
      { email },
      { code, expiresAt, verified: false, attempts: 0 },
      { upsert: true, new: true }
    );
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9f6; padding: 20px;">
        <div style="background: #2B7A4B; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🌿 GreenScape</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0;">Grow. Nurture. Thrive.</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2B7A4B; margin-top: 0;">📧 New Verification Code</h2>
          
          <p style="color: #333; line-height: 1.6;">Dear Customer,</p>
          <p style="color: #333; line-height: 1.6;">Here is your new verification code:</p>
          
          <div style="background: #f8f9f6; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="font-size: 48px; letter-spacing: 10px; color: #2B7A4B; margin: 0;">${code}</h2>
            <p style="color: #666; margin-top: 10px;">This code will expire in 15 minutes</p>
          </div>
          
          <p style="color: #666;">If you didn't request a new code, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© 2026 GreenScape. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const emailResult = await sendEmail(email, 'New Verification Code - GreenScape', html);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    res.json({
      success: true,
      message: 'New verification code sent'
    });
  } catch (err) {
    console.error('Error resending verification code:', err);
    res.status(500).json({ error: err.message });
  }
};