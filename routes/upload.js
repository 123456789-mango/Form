const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

// Video storage
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'blog-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
  }),
});

const imgUpload = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const videoUpload = multer({ storage: videoStorage, limits: { fileSize: 100 * 1024 * 1024 } });

// POST /api/upload          ← single cover image
router.post('/', auth, imgUpload.single('image'), (req, res) => {
  try {
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// POST /api/upload/gallery  ← multiple images
router.post('/gallery', auth, imgUpload.array('images', 10), (req, res) => {
  try {
    const urls = req.files.map(f => f.path);
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: 'Gallery upload failed' });
  }
});

// POST /api/upload/video    ← single video file
router.post('/video', auth, videoUpload.single('video'), (req, res) => {
  try {
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Video upload failed' });
  }
});

module.exports = router;