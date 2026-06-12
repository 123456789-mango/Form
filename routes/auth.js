const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'change_refresh_secret';

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, username: user.username },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/register
// Protect this endpoint with the server ADMIN_API_KEY header to seed users.
router.post('/register', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.headers['x-api-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role: role || 'admin', lastActivityAt: new Date() });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ error: 'Account is disabled' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.lastActivityAt = new Date();
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        displayName: user.displayName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (!user.isActive) return res.status(403).json({ error: 'Account is disabled' });

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    user.lastActivityAt = new Date();
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
