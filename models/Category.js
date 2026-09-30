// // models/Category.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
// import mongoose from "mongoose";

// const CategorySchema = new mongoose.Schema({
//   name: { 
//     type: String, 
//     required: [true, 'Category name is required'],
//     unique: true,
//     trim: true 
//   },
//   slug: { 
//     type: String, 
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   description: { 
//     type: String,
//     trim: true
//   },
//   image: { 
//     type: String,
//     default: 'https://via.placeholder.com/100'
//   },
//   icon: { type: String }, // Optional icon URL
//   products: { 
//     type: Number, 
//     default: 0 
//   },
//   status: { 
//     type: String, 
//     enum: ['Active', 'Inactive'], 
//     default: 'Active' 
//   }
// }, { 
//   timestamps: true 
// });

// const Category = mongoose.model('Category', CategorySchema);
// export default Category;







//  new version 
// models/Category.js - USE THIS IN BOTH ADMIN AND APP BACKENDS
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    unique: true,
    trim: true 
  },
  slug: { 
    type: String, 
    unique: true,
    trim: true,
    lowercase: true
  },
  description: { 
    type: String,
    trim: true
  },
  image: { 
    type: String,
    default: 'https://via.placeholder.com/100'
  },
  icon: { type: String }, // Optional icon URL
  products: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  }
}, { 
  timestamps: true 
});

// ==========================================
// ✅ INDEXES
// ==========================================
CategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
CategorySchema.index({ name: 1 }, { unique: true, sparse: true });
CategorySchema.index({ status: 1, createdAt: -1 });

const Category = mongoose.model('Category', CategorySchema);
export default Category;