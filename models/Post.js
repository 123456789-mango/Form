const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, required: true },  // HTML or markdown
  coverImage:  { type: String, default: '' },     // Cloudinary URL
  tags:        [{ type: String }],
  author:      { type: String, default: 'Admin' },
  icon:        { type: String, default: '' },     // icon name or URL
  slug:        { type: String, unique: true },    // for SEO URLs
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);