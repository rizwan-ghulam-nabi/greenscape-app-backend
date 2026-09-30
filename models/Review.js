// greenscape-backend/models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,   // ✅ Allow admin-created reviews
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 150,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ✅ Moderation status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    // ✅ Admin reply
    adminReply: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    adminRepliedAt: {
      type: Date,
      default: null,
    },
    adminRepliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    isAdminCreated: {
      type: Boolean,
      default: false,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });

// Fast lookups
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

// Virtuals
ReviewSchema.virtual('starString').get(function () {
  return '★'.repeat(this.rating || 0) + '☆'.repeat(5 - (this.rating || 0));
});

ReviewSchema.virtual('hasAdminReply').get(function () {
  return !!(this.adminReply && this.adminReply.trim().length > 0);
});

ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Review', ReviewSchema);