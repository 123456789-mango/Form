const router = require('express').Router();
const Role = require('../models/Role');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET all roles
router.get('/', auth, checkAdmin, async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET role by ID
router.get('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new role
router.post('/', auth, checkAdmin, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        const existing = await Role.findOne({ name });
        if (existing) {
            return res.status(409).json({ error: 'Role already exists' });
        }

        const role = new Role({
            name,
            description: description || '',
            permissions: permissions || []
        });

        await role.save();
        res.status(201).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE role by ID
router.put('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const { name, description, permissions, isActive } = req.body;

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            {
                name: name || undefined,
                description: description !== undefined ? description : undefined,
                permissions: permissions || undefined,
                isActive: isActive !== undefined ? isActive : undefined
            },
            { new: true, runValidators: true }
        );

        if (!role) return res.status(404).json({ error: 'Role not found' });

        res.json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE role by ID
router.delete('/:id', auth, checkAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });

        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
