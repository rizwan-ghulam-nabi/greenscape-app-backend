// app-backend/models/VerificationCode.js
import mongoose from 'mongoose';

const VerificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['register', 'password_reset', 'email_change'],
    default: 'register'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);
export default VerificationCode;