// // app-backend/models/VerificationCode.js
// import mongoose from 'mongoose';

// const VerificationCodeSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   code: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['register', 'password_reset', 'email_change'],
//     default: 'register'
//   },
//   expiresAt: {
//     type: Date,
//     required: true
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   attempts: {
//     type: Number,
//     default: 0
//   }
// }, { timestamps: true });

// VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);
// export default VerificationCode;









// new verion for perfomance

// app-backend/models/VerificationCode.js
import mongoose from 'mongoose';

const VerificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,   // ✅ normalize
    trim: true,
    // ✅ removed unique: true — now part of compound index
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

// ==========================================
// ✅ INDEXES
// ==========================================
// TTL — auto-delete expired docs
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// One active code per (email, type) — allows register + password_reset simultaneously
VerificationCodeSchema.index({ email: 1, type: 1 }, { unique: true });

// Fast verify lookup
VerificationCodeSchema.index({ email: 1, code: 1 });

// Fast resend cleanup (delete old codes for this email)
VerificationCodeSchema.index({ email: 1 });

// Optional — admin audit
VerificationCodeSchema.index({ createdAt: -1 });

const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);
export default VerificationCode;