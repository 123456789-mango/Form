const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB connected');
};

// Seed an admin user if none exists
const seedAdmin = async () => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const adminUser = process.env.ADMIN_USER || 'sysadmin';
    const adminPass = process.env.ADMIN_PASS || 'Neema@123';

    const exists = await User.findOne({ username: adminUser });
    if (exists) {
      console.log('Admin user already exists:', adminUser);
      return;
    }

    const hash = await bcrypt.hash(adminPass, 10);
    await User.create({ username: adminUser, password: hash, role: 'admin' });
    console.log('✅ Seeded admin user:', adminUser);
  } catch (err) {
    console.error('Failed to seed admin user:', err.message || err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  // ensure admin seeded on first DB connection
  if (isConnected) await seedAdmin();
  next();
});

app.use('/api/posts', require('../routes/posts'));
app.use('/api/upload', require('../routes/upload')); // ← handles /api/upload, /api/upload/gallery, /api/upload/video
app.use('/api/auth', require('../routes/auth'));
app.use('/api/clients', require('../routes/clients'));

app.get('/', (req, res) => res.json({ message: 'Blog API running ✅' }));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
module.exports.handler = serverless(app);