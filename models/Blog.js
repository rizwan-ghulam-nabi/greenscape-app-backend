// import mongoose from 'mongoose';

// const BlogSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   slug: { type: String, unique: true, trim: true },
//   excerpt: { type: String, required: true, trim: true },
//   content: { type: String, required: true },
//   image: { type: String, default: '' },
//   category: { type: String, required: true, trim: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   status: { 
//     type: String, 
//     enum: ['Published', 'Draft', 'Trash'], 
//     default: 'Draft' 
//   },
//   tags: [{ type: String, trim: true }],
//   views: { type: Number, default: 0 },
// }, { 
//   timestamps: true 
// });

// export default mongoose.model('Blog', BlogSchema);















//  new version 

import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  category: { type: String, required: true, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Published', 'Draft', 'Trash'], 
    default: 'Draft' 
  },
  tags: [{ type: String, trim: true }],
  views: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// ==========================================
// ✅ INDEXES
// ==========================================
BlogSchema.index({ slug: 1 }, { unique: true, sparse: true });
BlogSchema.index({ status: 1, createdAt: -1 });       // ← filter by 'Published' etc
BlogSchema.index({ category: 1, createdAt: -1 });     // ← filter by category
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' }); // ← full-text search

export default mongoose.model('Blog', BlogSchema);