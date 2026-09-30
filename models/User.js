// // models/User.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
// import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

// const UserSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: { type: String },
//   country: { type: String },
//   isAdmin: { type: Boolean, default: false },
//   role: { type: String, default: 'customer' },
  
//   // ✅ ONLY ONE emailVerified FIELD
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
  
//   subscribedToNewsletter: { type: Boolean, default: false },
//   profileImage: { type: String, default: null },
//   bio: { type: String, default: '' },
//   gender: { type: String, default: 'Prefer not to say' },
  
//   emailVerificationToken: { type: String },
//   emailVerificationExpires: { type: Date },
  
//   refreshToken: { type: String },
//   lastLogin: { type: Date },
//   loginAttempts: { type: Number, default: 0 },
//   lockUntil: { type: Date },
  
//   cart: [{
//     product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//     quantity: { type: Number, default: 1 }
//   }]
// }, { timestamps: true });

// // ==========================================
// // ✅ JWT METHODS
// // ==========================================

// // Generate JWT Auth Token
// UserSchema.methods.generateAuthToken = function () {
//   return jwt.sign(
//     { 
//       id: this._id, 
//       isAdmin: this.isAdmin,
//       role: this.role 
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: '4h' }
//   );
// };

// // Generate Refresh Token
// UserSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     { id: this._id },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// // ==========================================
// // ✅ PASSWORD METHODS
// // ==========================================

// // Compare password
// UserSchema.methods.matchPassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Hash password before saving
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // ==========================================
// // ✅ LOGIN ATTEMPT METHODS
// // ==========================================

// // Check if account is locked
// UserSchema.methods.isLocked = function () {
//   return this.lockUntil && this.lockUntil > Date.now();
// };

// // Increment login attempts
// UserSchema.methods.incrementLoginAttempts = async function () {
//   this.loginAttempts += 1;
//   if (this.loginAttempts >= 5) {
//     this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
//   }
//   await this.save();
// };

// // Reset login attempts
// UserSchema.methods.resetLoginAttempts = async function () {
//   this.loginAttempts = 0;
//   this.lockUntil = undefined;
//   this.lastLogin = new Date();
//   await this.save();
// };

// const User = mongoose.model('User', UserSchema);
// export default User;








// new version for perfomace
// models/User.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, default: 'customer' },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  subscribedToNewsletter: { type: Boolean, default: false },
  profileImage: { type: String, default: null },
  bio: { type: String, default: '' },
  gender: { type: String, default: 'Prefer not to say' },
  
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  
  refreshToken: { type: String },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

// ==========================================
// ✅ INDEXES
// ==========================================
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// ==========================================
// ✅ JWT METHODS
// ==========================================

// Generate JWT Auth Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      isAdmin: this.isAdmin,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );
};

// Generate Refresh Token
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// ✅ PASSWORD METHODS
// ==========================================

// Compare password
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==========================================
// ✅ LOGIN ATTEMPT METHODS
// ==========================================

// Check if account is locked
UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  await this.save();
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save();
};

const User = mongoose.model('User', UserSchema);
export default User;