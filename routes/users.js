const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all users (admin only)
router.get('/', auth, checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET specific user by ID (admin only)
router.get('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id).select('-password -refreshToken');
        if (!targetUser) return res.status(404).json({ error: 'User not found' });
        res.json(targetUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new user (admin only)
router.post('/', auth, checkAdmin, async (req, res) => {
    try {
        const { username, password, displayName, email, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hash,
            displayName: displayName || '',
            email: email || '',
            role: role || 'user',
            isActive: true
        });

        await user.save();
        res.status(201).json({ message: 'User created', user: user.toObject({ getters: true, virtuals: false }) });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE current user profile
router.put('/me', auth, async (req, res) => {
    try {
        const { displayName, email, phone, department, bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                displayName: displayName || '',
                email: email || '',
                phone: phone || '',
                department: department || '',
                bio: bio || '',
                lastActivityAt: new Date()
            },
            { new: true }
        ).select('-password -refreshToken');

        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE user password
router.put('/me/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Verify current password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

        // Hash new password
        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        user.lastActivityAt = new Date();
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE user by ID (admin only)
router.put('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const { displayName, email, phone, department, bio, role, isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                displayName: displayName || '',
                email: email || '',
                phone: phone || '',
                department: department || '',
                bio: bio || '',
                role: role || 'user',
                isActive: isActive !== undefined ? isActive : true
            },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE user (admin only)
router.delete('/:id', auth, checkAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
