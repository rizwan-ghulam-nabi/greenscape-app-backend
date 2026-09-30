// // greenscape-backend/models/Discount.js
// import mongoose from 'mongoose';

// const DiscountSchema = new mongoose.Schema(
//   {
//     name: { 
//       type: String, 
//       required: true, 
//       trim: true 
//     },
//     description: { 
//       type: String, 
//       trim: true 
//     },
//     code: { 
//       type: String, 
//       required: true, 
//       unique: true, 
//       uppercase: true,
//       trim: true 
//     },
//     type: { 
//       type: String, 
//       enum: ['percentage', 'fixed'], 
//       required: true,
//       default: 'percentage'
//     },
//     value: { 
//       type: Number, 
//       required: true,
//       min: 0
//     },
//     appliesTo: {
//       type: String,
//       enum: ['all_products', 'specific_products', 'categories', 'new_arrivals'],
//       default: 'all_products'
//     },
//     products: [{ 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'Product' 
//     }],
//     categories: [{ 
//       type: mongoose.Schema.Types.ObjectId, 
//       ref: 'Category' 
//     }],
//     minPurchase: { 
//       type: Number, 
//       default: 0 
//     },
//     maxUses: { 
//       type: Number, 
//       default: 0 
//     },
//     usedCount: { 
//       type: Number, 
//       default: 0 
//     },
//     maxUsesPerCustomer: {
//       type: Number,
//       default: 1
//     },
//     startDate: { 
//       type: Date, 
//       required: true 
//     },
//     endDate: { 
//       type: Date, 
//       required: true 
//     },
//     isActive: { 
//       type: Boolean, 
//       default: true 
//     },
//     image: {
//       type: String,
//       default: null
//     },
//     badgeText: {
//       type: String,
//       default: null
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   { 
//     timestamps: true 
//   }
// );

// const Discount = mongoose.model('Discount', DiscountSchema);
// export default Discount;










//  new version
// greenscape-backend/models/Discount.js
import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true,
      trim: true 
    },
    type: { 
      type: String, 
      enum: ['percentage', 'fixed'], 
      required: true,
      default: 'percentage'
    },
    value: { 
      type: Number, 
      required: true,
      min: 0
    },
    appliesTo: {
      type: String,
      enum: ['all_products', 'specific_products', 'categories', 'new_arrivals'],
      default: 'all_products'
    },
    products: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    categories: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category' 
    }],
    minPurchase: { 
      type: Number, 
      default: 0 
    },
    maxUses: { 
      type: Number, 
      default: 0 
    },
    usedCount: { 
      type: Number, 
      default: 0 
    },
    maxUsesPerCustomer: {
      type: Number,
      default: 1
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    image: {
      type: String,
      default: null
    },
    badgeText: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true 
  }
);

// ==========================================
// ✅ INDEXES
// ==========================================
DiscountSchema.index({ code: 1 }, { unique: true, sparse: true });
DiscountSchema.index({ isActive: 1, endDate: 1 });
DiscountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
DiscountSchema.index({ appliesTo: 1 });
DiscountSchema.index({ createdAt: -1 });

const Discount = mongoose.model('Discount', DiscountSchema);
export default Discount;
