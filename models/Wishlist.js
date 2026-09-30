// // backend/models/Wishlist.js
// import mongoose from 'mongoose';

// const WishlistSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   items: [{
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true
//     },
//     addedAt: {
//       type: Date,
//       default: Date.now
//     }
//   }]
// }, {
//   timestamps: true
// });

// export default mongoose.model('Wishlist', WishlistSchema);








//  new version for perfomace 

// backend/models/Wishlist.js
import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// ==========================================
// ✅ INDEXES
// ==========================================
WishlistSchema.index({ user: 1 }, { unique: true, sparse: true });
WishlistSchema.index({ 'items.product': 1 });
WishlistSchema.index({ createdAt: -1 });

export default mongoose.model('Wishlist', WishlistSchema);