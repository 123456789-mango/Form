const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB connected');
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/posts',  require('../routes/posts'));
app.use('/api/upload', require('../routes/upload'));

app.get('/', (req, res) => res.json({ message: 'Blog API running ✅' }));

// ✅ Add this — local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.handler = serverless(app);