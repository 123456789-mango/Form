const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

// GET dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Count posts
        const totalPosts = await Post.countDocuments();
        const galleryCount = await Post.aggregate([
            { $group: { _id: null, total: { $sum: { $size: { $ifNull: ['$gallery', []] } } } } }
        ]);
        const videoCount = await Post.aggregate([
            { $group: { _id: null, total: { $sum: { $size: { $ifNull: ['$videos', []] } } } } }
        ]);

        // Count users
        const totalUsers = await User.countDocuments();

        // Count clients and calculate total shares
        const totalClients = await Client.countDocuments();
        const clientStats = await Client.aggregate([
            {
                $group: {
                    _id: null,
                    totalShares: { $sum: '$noOfShare' },
                    totalClients: { $sum: 1 }
                }
            }
        ]);

        // Get recent posts
        const recentPosts = await Post.find()
            .select('title createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent clients
        const recentClients = await Client.find()
            .select('name username createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const stats = {
            posts: {
                total: totalPosts,
                galleries: galleryCount[0]?.total || 0,
                videos: videoCount[0]?.total || 0
            },
            users: {
                total: totalUsers
            },
            clients: {
                total: totalClients,
                totalShares: clientStats[0]?.totalShares || 0
            },
            recent: {
                posts: recentPosts,
                clients: recentClients
            },
            timestamp: new Date()
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
