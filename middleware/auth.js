const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1) Allow legacy API key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.ADMIN_API_KEY) return next();

    // 2) Allow Authorization: Bearer <token>
    const auth = req.headers['authorization'] || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: 'Unauthorized' });

    const token = m[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};