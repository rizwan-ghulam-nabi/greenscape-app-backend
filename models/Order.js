// // models/Order.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
// import mongoose from 'mongoose';

// const OrderItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true },
//   image: { type: String }
// });

// const OrderSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   orderNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   items: [OrderItemSchema],
  
//   shippingAddress: {
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     zip: { type: String, required: true },
//     country: { type: String, required: true }
//   },

//   paymentMethod: {
//     type: String,
//     enum: ['jazzcash', 'cash on delivery'],
//     default: 'cash on delivery'
//   },

//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'failed', 'refunded'],
//     default: 'pending'
//   },

//   orderStatus: {
//     type: String,
//     enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },

//   // ===== PRICING & DELIVERY CHARGES =====
//   subtotal: { type: Number, required: true },
//   deliveryCharge: {
//     type: Number,
//     default: 500 // Standard delivery charge
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   isFirstOrder: {
//     type: Boolean,
//     default: false
//   },
//   freeDeliveryApplied: {
//     type: Boolean,
//     default: false
//   },
//   totalAmount: { type: Number, required: true },

//   // ===== HISTORY & TIMESTAMPS =====
//   statusHistory: [{
//     status: {
//       type: String,
//       enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
//     },
//     changedAt: { type: Date, default: Date.now },
//     note: { type: String }
//   }],

//   trackingNumber: { type: String },
//   estimatedDelivery: { type: Date },
//   deliveredAt: { type: Date },

//   // For cancellations or returns
//   cancelledAt: { type: Date },
//   cancellationReason: { type: String },
//   refundedAt: { type: Date },

//   // ===== ADMIN NOTES =====
//   adminNotes: { type: String }

// }, { timestamps: true });

// // ==========================================
// // MIDDLEWARE: Auto-generate Order Number before saving
// // ==========================================
// OrderSchema.pre('save', async function (next) {
//   if (!this.orderNumber) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
    
//     // Generate a random 4-digit suffix
//     const random = Math.floor(1000 + Math.random() * 9000);
    
//     this.orderNumber = `GS-${year}${month}${day}-${random}`;
//   }
//   next();
// });

// // ==========================================
// // METHOD: Update Order Status (Auto-tracks history)
// // ==========================================
// OrderSchema.methods.updateStatus = async function (newStatus, note = '') {
//   this.orderStatus = newStatus;
  
//   this.statusHistory.push({
//     status: newStatus,
//     changedAt: new Date(),
//     note
//   });

//   // Auto-set delivery date if delivered
//   if (newStatus === 'delivered') {
//     this.deliveredAt = new Date();
//   }

//   // Auto-set cancelled date if cancelled
//   if (newStatus === 'cancelled') {
//     this.cancelledAt = new Date();
//   }

//   await this.save();
//   return this;
// };

// // ==========================================
// // METHOD: Get formatted order history
// // ==========================================
// OrderSchema.methods.getHistory = function () {
//   return this.statusHistory.sort((a, b) => b.changedAt - a.changedAt);
// };

// const Order = mongoose.model('Order', OrderSchema);
// export default Order;














//  new version for perfomance

// models/Order.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [OrderItemSchema],
  
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },

  paymentMethod: {
    type: String,
    enum: ['jazzcash', 'cash on delivery'],
    default: 'cash on delivery'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // ===== PRICING & DELIVERY CHARGES =====
  subtotal: { type: Number, required: true },
  deliveryCharge: {
    type: Number,
    default: 500
  },
  discount: {
    type: Number,
    default: 0
  },
  isFirstOrder: {
    type: Boolean,
    default: false
  },
  freeDeliveryApplied: {
    type: Boolean,
    default: false
  },
  totalAmount: { type: Number, required: true },

  // ===== HISTORY & TIMESTAMPS =====
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    changedAt: { type: Date, default: Date.now },
    note: { type: String }
  }],

  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },

  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  refundedAt: { type: Date },

  adminNotes: { type: String }

}, { timestamps: true });

// ==========================================
// ✅ INDEXES
// ==========================================
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'shippingAddress.email': 1 });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });

// ==========================================
// MIDDLEWARE: Auto-generate Order Number before saving
// ==========================================
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const random = Math.floor(1000 + Math.random() * 9000);
    
    this.orderNumber = `GS-${year}${month}${day}-${random}`;
  }
  next();
});

// ==========================================
// METHOD: Update Order Status (Auto-tracks history)
// ==========================================
OrderSchema.methods.updateStatus = async function (newStatus, note = '') {
  this.orderStatus = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    note
  });

  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }

  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }

  await this.save();
  return this;
};

// ==========================================
// METHOD: Get formatted order history
// ==========================================
OrderSchema.methods.getHistory = function () {
  return this.statusHistory.sort((a, b) => b.changedAt - a.changedAt);
};

const Order = mongoose.model('Order', OrderSchema);
export default Order;

