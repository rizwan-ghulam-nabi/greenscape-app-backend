// // // app/backend/models/Product.js
// // import mongoose from "mongoose";

// // const ProductSchema = new mongoose.Schema({
// //   // ===== BASIC INFO =====
// //   name: { type: String, required: true },
// //   slug: { type: String }, // For clean SEO URLs (e.g., "money-plant")
// //   desc: { type: String, required: true },
// //   shortDesc: { type: String }, // For quick previews in the Admin Panel
  
// //   // ===== PRICING & DISCOUNTS =====
// //   price: { type: Number, required: true },
// //   oldPrice: { type: Number }, // Used to calculate discount
  
// //   // ===== CATEGORIES & TAGS =====
// //   category: { type: String, required: true },
// //   subCategory: { type: String }, // e.g., "Indoor" under "Plants"
// //   tags: [{ type: String }], // e.g., ["summer", "best-seller", "low-maintenance"]
  
// //   // ===== INVENTORY =====
// //   stock: { type: Number, default: 0 },
// //   sku: { type: String, unique: true }, // Internal product code
  
// //   // ===== IMAGES =====
// //   image: { type: String, required: true },
// //   gallery: [{ type: String }], // For additional product images
  
// //   // ===== PRODUCT STATUS =====
// //   isActive: { type: Boolean, default: true }, // Visible on storefront
// //   isFeatured: { type: Boolean, default: false }, // Promoted on Homepage
// //   isBestSeller: { type: Boolean, default: false }, // Marked as Bestseller
  
// //   // ===== RATINGS & REVIEWS =====
// //   rating: { type: Number, default: 0, min: 0, max: 5 },
// //   numReviews: { type: Number, default: 0 },

// //   // ===== SALE LOGIC =====
// //   saleStartDate: { type: Date },
// //   saleEndDate: { type: Date },

// // }, { 
// //   timestamps: true,
// //   toJSON: { virtuals: true },
// //   toObject: { virtuals: true }
// // });

// // // ==========================================
// // // VIRTUAL: Automatically calculate discount percentage
// // // ==========================================
// // ProductSchema.virtual('discountPercentage').get(function () {
// //   if (!this.oldPrice || this.oldPrice <= this.price) return 0;
// //   return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
// // });

// // // ==========================================
// // // VIRTUAL: Check if product is currently on sale
// // // ==========================================
// // ProductSchema.virtual('isOnSale').get(function () {
// //   const now = new Date();
// //   if (this.saleStartDate && this.saleEndDate) {
// //     return now >= this.saleStartDate && now <= this.saleEndDate;
// //   }
// //   return this.oldPrice && this.oldPrice > this.price;
// // });

// // // ==========================================
// // // ✅ MIDDLEWARE to Auto-generate Slug and SKU before saving
// // // ==========================================
// // ProductSchema.pre('save', function (next) {
// //   // Generate a URL-friendly slug from the product name
// //   if (!this.slug) {
// //     this.slug = this.name
// //       .toLowerCase()
// //       .replace(/[^a-z0-9]+/g, '-')
// //       .replace(/(^-|-$)/g, '');
// //   }

// //   // Generate a unique SKU if not provided
// //   if (!this.sku) {
// //     const prefix = this.category.substring(0, 3).toUpperCase();
// //     const timestamp = Date.now().toString().slice(-6);
// //     const random = Math.floor(1000 + Math.random() * 9000);
// //     this.sku = `${prefix}-${timestamp}-${random}`;
// //   }

// //   return; 
// // });

// // // ==========================================
// // // METHOD: Reduce stock when an order is placed
// // // ==========================================
// // ProductSchema.methods.reduceStock = async function (quantity) {
// //   if (this.stock < quantity) {
// //     throw new Error(`Insufficient stock for ${this.name}. Available: ${this.stock}`);
// //   }
// //   this.stock -= quantity;
// //   await this.save();
// //   return this;
// // };

// // // ==========================================
// // // METHOD: Restore stock when an order is cancelled
// // // ==========================================
// // ProductSchema.methods.restoreStock = async function (quantity) {
// //   this.stock += quantity;
// //   await this.save();
// //   return this;
// // };

// // const Product = mongoose.model('Product', ProductSchema);
// // export default Product;












// // app/backend/models/Product.js - UPDATED VERSION
// import mongoose from "mongoose";

// const ProductSchema = new mongoose.Schema({
//   // ===== BASIC INFO =====
//   name: { type: String, required: true, trim: true },
//   slug: { type: String, unique: true, lowercase: true },
//   desc: { type: String, required: true },
//   shortDesc: { type: String },
  
//   // ===== PRICING & DISCOUNTS =====
//   price: { type: Number, required: true, min: 0 },
//   oldPrice: { type: Number, min: 0 },
//   costPrice: { type: Number, min: 0 }, // ✅ ADDED
  
//   // ===== CATEGORIES & TAGS =====
//   category: { type: String, required: true, index: true },
//   subCategory: { type: String, index: true },
//   tags: [{ type: String, index: true }],
  
//   // ===== INVENTORY =====
//   stock: { type: Number, default: 0, min: 0 },
//   sku: { type: String, unique: true, index: true },
//   lowStockAlert: { type: Number, default: 5 }, // ✅ ADDED
  
//   // ===== IMAGES =====
//   image: { type: String, required: true },
//   gallery: [{ type: String }],
//   thumbnail: { type: String }, // ✅ ADDED
  
//   // ===== PRODUCT STATUS =====
//   isActive: { type: Boolean, default: true, index: true },
//   isFeatured: { type: Boolean, default: false, index: true },
//   isBestSeller: { type: Boolean, default: false, index: true },
//   isNewArrival: { type: Boolean, default: false }, // ✅ ADDED
  
//   // ===== RATINGS & REVIEWS =====
//   rating: { type: Number, default: 0, min: 0, max: 5 },
//   numReviews: { type: Number, default: 0 },
//   reviewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], // ✅ ADDED

//   // ===== SALE LOGIC =====
//   saleStartDate: { type: Date },
//   saleEndDate: { type: Date },

//   // ===== SEARCH & SEO =====
//   searchKeywords: [{ type: String }], // ✅ ADDED
//   metaTitle: { type: String, maxlength: 60 }, // ✅ ADDED
//   metaDescription: { type: String, maxlength: 160 }, // ✅ ADDED

//   // ===== DIMENSIONS & WEIGHT =====
//   weight: { type: Number, min: 0 }, // ✅ ADDED
//   dimensions: { // ✅ ADDED
//     length: { type: Number, min: 0 },
//     width: { type: Number, min: 0 },
//     height: { type: Number, min: 0 }
//   },

//   // ===== VARIATIONS =====
//   hasVariations: { type: Boolean, default: false }, // ✅ ADDED
//   variations: [{ // ✅ ADDED
//     sku: { type: String, required: true },
//     price: { type: Number, required: true },
//     stock: { type: Number, default: 0 },
//     attributes: { type: Map, of: String },
//     image: String
//   }]

// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // ==========================================
// // VIRTUAL: Automatically calculate discount percentage
// // ==========================================
// ProductSchema.virtual('discountPercentage').get(function () {
//   if (!this.oldPrice || this.oldPrice <= this.price) return 0;
//   return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
// });

// // ==========================================
// // VIRTUAL: Check if product is currently on sale
// // ==========================================
// ProductSchema.virtual('isOnSale').get(function () {
//   const now = new Date();
//   if (this.saleStartDate && this.saleEndDate) {
//     return now >= this.saleStartDate && now <= this.saleEndDate;
//   }
//   return this.oldPrice && this.oldPrice > this.price;
// });

// // ==========================================
// // VIRTUAL: Check if product is low stock
// // ==========================================
// ProductSchema.virtual('isLowStock').get(function () {
//   return this.stock > 0 && this.stock <= this.lowStockAlert;
// });

// // ==========================================
// // VIRTUAL: Calculate profit margin
// // ==========================================
// ProductSchema.virtual('profitMargin').get(function () {
//   if (!this.costPrice || this.costPrice === 0) return 0;
//   const margin = ((this.price - this.costPrice) / this.price) * 100;
//   return Math.round(margin);
// });

// // ==========================================
// // ✅ MIDDLEWARE to Auto-generate Slug and SKU before saving
// // ==========================================
// ProductSchema.pre('save', function (next) {
//   // Generate a URL-friendly slug from the product name
//   if (!this.slug) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '');
//   }

//   // Generate a unique SKU if not provided
//   if (!this.sku) {
//     const prefix = this.category.substring(0, 3).toUpperCase();
//     const timestamp = Date.now().toString().slice(-6);
//     const random = Math.floor(1000 + Math.random() * 9000);
//     this.sku = `${prefix}-${timestamp}-${random}`;
//   }

//   // Auto-generate search keywords if not provided
//   if (!this.searchKeywords || this.searchKeywords.length === 0) {
//     const keywords = new Set();
//     this.name.toLowerCase().split(' ').forEach(word => {
//       if (word.length > 2) keywords.add(word);
//     });
//     if (this.category) keywords.add(this.category.toLowerCase());
//     if (this.tags) this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
//     this.searchKeywords = Array.from(keywords);
//   }

//   return next(); 
// });

// // ==========================================
// // METHOD: Reduce stock when an order is placed
// // ==========================================
// ProductSchema.methods.reduceStock = async function (quantity) {
//   if (this.stock < quantity) {
//     throw new Error(`Insufficient stock for ${this.name}. Available: ${this.stock}`);
//   }
//   this.stock -= quantity;
//   await this.save();
//   return this;
// };

// // ==========================================
// // METHOD: Restore stock when an order is cancelled
// // ==========================================
// ProductSchema.methods.restoreStock = async function (quantity) {
//   this.stock += quantity;
//   await this.save();
//   return this;
// };

// // ==========================================
// // METHOD: Calculate average rating
// // ==========================================
// ProductSchema.methods.calculateAverageRating = async function () {
//   const Review = mongoose.model('Review');
//   const result = await Review.aggregate([
//     { $match: { productId: this._id, isApproved: true } },
//     { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
//   ]);
  
//   if (result.length > 0) {
//     this.rating = Math.round(result[0].avgRating * 10) / 10;
//     this.numReviews = result[0].count;
//     await this.save();
//   }
//   return this.rating;
// };

// const Product = mongoose.model('Product', ProductSchema);
// export default Product;












//  new version for perfomace 

// app/backend/models/Product.js - UPDATED VERSION
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  // ===== BASIC INFO =====
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  desc: { type: String, required: true },
  shortDesc: { type: String },
  
  // ===== PRICING & DISCOUNTS =====
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  costPrice: { type: Number, min: 0 },
  
  // ===== CATEGORIES & TAGS =====
  category: { type: String, required: true, index: true },
  subCategory: { type: String, index: true },
  tags: [{ type: String, index: true }],
  
  // ===== INVENTORY =====
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true, index: true },
  lowStockAlert: { type: Number, default: 5 },
  
  // ===== IMAGES =====
  image: { type: String, required: true },
  gallery: [{ type: String }],
  thumbnail: { type: String },
  
  // ===== PRODUCT STATUS =====
  isActive: { type: Boolean, default: true, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  isBestSeller: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false },
  
  // ===== RATINGS & REVIEWS =====
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  reviewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

  // ===== SALE LOGIC =====
  saleStartDate: { type: Date },
  saleEndDate: { type: Date },

  // ===== SEARCH & SEO =====
  searchKeywords: [{ type: String }],
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },

  // ===== DIMENSIONS & WEIGHT =====
  weight: { type: Number, min: 0 },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },

  // ===== VARIATIONS =====
  hasVariations: { type: Boolean, default: false },
  variations: [{
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    attributes: { type: Map, of: String },
    image: String
  }]

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==========================================
// ✅ INDEXES
// ==========================================
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ category: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isBestSeller: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index(
  { name: 'text', desc: 'text', shortDesc: 'text', searchKeywords: 'text' },
  { weights: { name: 10, searchKeywords: 5, shortDesc: 3, desc: 1 }, name: 'ProductTextIndex' }
);

// ==========================================
// VIRTUAL: Automatically calculate discount percentage
// ==========================================
ProductSchema.virtual('discountPercentage').get(function () {
  if (!this.oldPrice || this.oldPrice <= this.price) return 0;
  return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
});

// ==========================================
// VIRTUAL: Check if product is currently on sale
// ==========================================
ProductSchema.virtual('isOnSale').get(function () {
  const now = new Date();
  if (this.saleStartDate && this.saleEndDate) {
    return now >= this.saleStartDate && now <= this.saleEndDate;
  }
  return this.oldPrice && this.oldPrice > this.price;
});

// ==========================================
// VIRTUAL: Check if product is low stock
// ==========================================
ProductSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockAlert;
});

// ==========================================
// VIRTUAL: Calculate profit margin
// ==========================================
ProductSchema.virtual('profitMargin').get(function () {
  if (!this.costPrice || this.costPrice === 0) return 0;
  const margin = ((this.price - this.costPrice) / this.price) * 100;
  return Math.round(margin);
});

// ==========================================
// ✅ MIDDLEWARE to Auto-generate Slug and SKU before saving
// ==========================================
ProductSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${prefix}-${timestamp}-${random}`;
  }

  if (!this.searchKeywords || this.searchKeywords.length === 0) {
    const keywords = new Set();
    this.name.toLowerCase().split(' ').forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    if (this.category) keywords.add(this.category.toLowerCase());
    if (this.tags) this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    this.searchKeywords = Array.from(keywords);
  }

  return next(); 
});

// ==========================================
// METHOD: Reduce stock when an order is placed
// ==========================================
ProductSchema.methods.reduceStock = async function (quantity) {
  if (this.stock < quantity) {
    throw new Error(`Insufficient stock for ${this.name}. Available: ${this.stock}`);
  }
  this.stock -= quantity;
  await this.save();
  return this;
};

// ==========================================
// METHOD: Restore stock when an order is cancelled
// ==========================================
ProductSchema.methods.restoreStock = async function (quantity) {
  this.stock += quantity;
  await this.save();
  return this;
};

// ==========================================
// ✅ METHOD: Calculate average rating — FIXED field names
// ==========================================
ProductSchema.methods.calculateAverageRating = async function () {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    // ✅ FIXED: match uses 'product' (schema field) and 'status: approved' (schema enum)
    { $match: { product: this._id, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (result.length > 0) {
    this.rating = Math.round(result[0].avgRating * 10) / 10;
    this.numReviews = result[0].count;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  await this.save();
  return this.rating;
};

const Product = mongoose.model('Product', ProductSchema);
export default Product;