const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// GET current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all users (admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET specific user by ID (admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const targetUser = await User.findById(req.params.id).select('-password');
        if (!targetUser) return res.status(404).json({ error: 'User not found' });
        res.json(targetUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
                bio: bio || ''
            },
            { new: true }
        ).select('-password');

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
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE user by ID (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { displayName, email, phone, department, bio, role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                displayName: displayName || '',
                email: email || '',
                phone: phone || '',
                department: department || '',
                bio: bio || '',
                role: role || 'admin'
            },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE user (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

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
