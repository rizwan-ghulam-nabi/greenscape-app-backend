// app-backend/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import VerificationCode from '../models/VerificationCode.js';
import { sendEmail } from '../utils/emailService.js';

// ==========================================
// ✅ REGISTER USER (With Email Verification)
// ==========================================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, country } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user (emailVerified false by default)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      country,
      isAdmin: false,
      role: "customer",
      emailVerified: false
    });

    await user.save();

    // ✅ Send verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await VerificationCode.findOneAndUpdate(
      { email },
      { code, type: 'register', expiresAt, verified: false, attempts: 0 },
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
          
          <p style="color: #333; line-height: 1.6;">Dear ${firstName || 'Customer'},</p>
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
      console.log('⚠️ Email failed to send, but registration continued');
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Verification code sent to your email.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        country: user.country,
        bio: user.bio,
        gender: user.gender,
        emailVerified: user.emailVerified
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// ✅ LOGIN USER
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isLocked && user.isLocked()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ 
        error: `Account locked. Try again in ${remaining} minutes.` 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.resetLoginAttempts) {
      await user.resetLoginAttempts();
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        country: user.country,
        bio: user.bio,
        gender: user.gender,
        emailVerified: user.emailVerified
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// ✅ GET CURRENT USER
// ==========================================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshToken -loginAttempts -lockUntil");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        isAdmin: user.isAdmin,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        gender: user.gender,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// ✅ UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    const allowedUpdates = [
      "firstName", "lastName", "phone", "country", 
      "bio", "gender", "profileImage"
    ];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      success: true,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        country: updatedUser.country,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
        gender: updatedUser.gender,
        emailVerified: updatedUser.emailVerified
      }
    });
    
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ 
      success: false,
      error: "Error updating profile" 
    });
  }
};

// ==========================================
// ✅ LOGOUT
// ==========================================
export const logout = async (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ 
    success: true,
    message: "Logged out successfully" 
  });
};

// ==========================================
// ✅ CHECK EMAIL VERIFICATION STATUS
// ==========================================
export const checkEmailVerification = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      success: true,
      user: {
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// ✅ REFRESH TOKEN
// ==========================================
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};