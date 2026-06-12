const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: 'admin' },
  // User profile details
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  bio: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
