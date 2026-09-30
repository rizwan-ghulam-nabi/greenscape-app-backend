// backend/models/Banner.js
import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFO
    // ==========================================
    title: { type: String, required: true },
    bannerType: {
      type: String,
      enum: ['Hero Large', 'Hero Small', 'Sidebar', 'Popup'],
      default: 'Hero Large',
    },
    image: { type: String, required: true },
    altText: { type: String },
    order: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },

    // ==========================================
    // LINK TARGET
    // ==========================================
    linkType: {
      type: String,
      enum: ['Category', 'Product', 'Custom URL', 'None'],
      default: 'None',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    customUrl: { type: String },

    // ==========================================
    // ✅ BUTTON (THE FIX)
    // ==========================================
    button: {
      text: { type: String, default: 'Shop Now' },
      position: {
        type: String,
        enum: [
          'Bottom Left',
          'Bottom Center',
          'Bottom Right',
          'Center',
          'Center Left',
          'Center Right',
          'Top Left',
          'Top Right',
        ],
        default: 'Center',
      },
      size: {
        type: String,
        enum: ['Small', 'Medium', 'Large'],
        default: 'Medium',
      },
      style: {
        type: String,
        enum: ['Solid', 'Outline', 'Ghost'],
        default: 'Solid',
      },
      bgColor: { type: String, default: '#0f5a2e' },
      textColor: { type: String, default: '#ffffff' },
      hoverBgColor: { type: String, default: '#0a4221' },
      borderRadius: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'md',
      },
      showArrow: { type: Boolean, default: true },
    },

    // ==========================================
    // OVERLAY
    // ==========================================
    overlayType: {
      type: String,
      enum: ['Light', 'Dark', 'None'],
      default: 'Dark',
    },
    overlayOpacity: {
      type: Number,
      min: 0,
      max: 100,
      default: 30,
    },

    // ==========================================
    // DISPLAY
    // ==========================================
    showOnDesktop: { type: Boolean, default: true },
    showOnTablet: { type: Boolean, default: true },
    showOnMobile: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    showOnPages: {
      home: { type: Boolean, default: true },
      shop: { type: Boolean, default: false },
      category: { type: Boolean, default: false },
      product: { type: Boolean, default: false },
    },

    // ==========================================
    // LAYOUT
    // ==========================================
    marginTop: { type: Number, default: 0 },
    marginBottom: { type: Number, default: 0 },
    animation: {
      type: String,
      enum: ['Fade In', 'Slide Up', 'None'],
      default: 'Fade In',
    },
    animationDuration: { type: Number, default: 800 },
  },
  { timestamps: true }
);


// ==========================================
// ✅ INDEXES
// ==========================================
BannerSchema.index({ isActive: 1, order: 1 });
BannerSchema.index({ isActive: 1, bannerType: 1 });
BannerSchema.index({ createdAt: -1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
BannerSchema.index({ 'showOnPages.home': 1 });

export default mongoose.model('Banner', BannerSchema);