const router = require('express').Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'sysadmin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'Neema@123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    if (!process.env.ADMIN_API_KEY) return res.status(500).json({ error: 'Server API key not configured' });
    return res.json({ apiKey: process.env.ADMIN_API_KEY });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
