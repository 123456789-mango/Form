const router = require('express').Router();
const Client = require('../models/Client');
const auth = require('../middleware/auth');

// GET all clients
router.get('/', auth, async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET client by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new client
router.post('/', auth, async (req, res) => {
    try {
        const { id, name, dpId, username, password, pin, crn, noOfShare } = req.body;

        // Validate required fields
        if (!name || !dpId || !username || !password || !pin || !crn) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const client = new Client({
            id,
            name,
            dpId,
            username,
            password,
            pin,
            crn,
            noOfShare: noOfShare || 0,
        });

        await client.save();
        res.status(201).json(client);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE client by ID
router.put('/:id', auth, async (req, res) => {
    try {
        const allowedFields = ['name', 'dpId', 'username', 'password', 'pin', 'crn', 'noOfShare', 'sessionId', 'demat', 'boid', 'loggedInName'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const client = await Client.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!client) return res.status(404).json({ error: 'Client not found' });

        res.json(client);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE client by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        res.json({ message: 'Client deleted successfully', client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
