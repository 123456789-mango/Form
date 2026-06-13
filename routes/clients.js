const router = require('express').Router();
const Client = require('../models/Client');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET all clients
router.get('/', auth, async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
        const user = await User.findById(req.user.id);

        // Admin sees all clients
        if (user.role === 'admin') {
            const clients = await Client.find().populate('createdBy', 'username displayName').sort({ createdAt: -1 });
            return res.json(clients);
        }

        // Other users see only their own clients
        const clients = await Client.find({ createdBy: req.user.id }).populate('createdBy', 'username displayName').sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET client by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).populate('createdBy', 'username displayName');
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const user = await User.findById(req.user.id);

        // Only admin or creator can view
        if (user.role !== 'admin' && client.createdBy && client.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to view this client' });
        }

        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new client
router.post('/', auth, async (req, res) => {
    try {
        // ✅ REMOVED 'id' from destructuring - MongoDB handles _id automatically
        const { name, dpId, username, password, pin, crn, demat, bankId, noOfShare } = req.body;

        // ✅ Added demat and bankId to validation (they're required in schema now)
        if (!name || !dpId || !username || !password || !pin || !crn || !demat || !bankId) {
            return res.status(400).json({ error: 'Missing required fields: name, dpId, username, password, pin, crn, demat, bankId' });
        }

        const client = new Client({
            // ✅ REMOVED 'id' field - no longer needed
            name,
            dpId,
            username,
            password,
            pin,
            crn,
            demat,      // ✅ Added
            bankId,     // ✅ Added
            noOfShare: noOfShare || 10,
            createdBy: req.user.id,
        });

        await client.save();
        await client.populate('createdBy', 'username displayName');
        res.status(201).json(client);
    } catch (err) {
        console.error('Create client error:', err);
        res.status(400).json({ error: err.message });
    }
});

// UPDATE client by ID
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const client = await Client.findById(req.params.id);

        if (!client) return res.status(404).json({ error: 'Client not found' });

        // Only admin or creator can edit
        if (user.role !== 'admin' && client.createdBy && client.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this client' });
        }

        // ✅ ADDED 'demat' and 'bankId' to allowedFields
        const allowedFields = ['name', 'dpId', 'username', 'password', 'pin', 'crn', 'demat', 'bankId', 'noOfShare', 'sessionId', 'boid', 'loggedInName'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // ✅ Use findByIdAndUpdate with proper options
        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id, 
            { $set: updates },
            { 
                new: true,           // Return updated document
                runValidators: true, // Run schema validation
                context: 'query'     // Required for validators to work
            }
        ).populate('createdBy', 'username displayName');

        res.json(updatedClient);
    } catch (err) {
        console.error('Update client error:', err);
        res.status(400).json({ error: err.message });
    }
});

// DELETE client by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const client = await Client.findById(req.params.id);

        if (!client) return res.status(404).json({ error: 'Client not found' });

        // Only admin or creator can delete
        if (user.role !== 'admin' && client.createdBy && client.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this client' });
        }

        await Client.findByIdAndDelete(req.params.id);
        res.json({ message: 'Client deleted successfully', client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;