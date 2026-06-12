const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  tags: [{ type: String }],
  author: { type: String, default: 'Admin' },
  icon: { type: String, default: '' },
  category: { type: String, default: 'General' },
  slug: { type: String, unique: true },
  gallery: [{ type: String }],
  videos: [{
    type: { type: String, enum: ['upload', 'url'] },
    url: { type: String },
    title: { type: String, default: '' },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);