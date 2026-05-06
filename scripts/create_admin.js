#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

const MONGO_URI = getArg('--uri') || process.env.MONGO_URI;
const USERNAME = getArg('--user') || process.env.ADMIN_USER || 'sysadmin';
const PASSWORD = getArg('--pass') || process.env.ADMIN_PASS || 'Neema@123';

if (!MONGO_URI) {
  console.error('Missing Mongo URI. Provide with --uri or set MONGO_URI in environment.');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ username: USERNAME });
    if (existing) {
      console.log(`User ${USERNAME} already exists`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 10);
    const user = new User({ username: USERNAME, password: hash, role: 'admin' });
    await user.save();
    console.log(`Created user ${USERNAME}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message || err);
    process.exit(1);
  }
}

run();
