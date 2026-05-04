const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }], // auto resize
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST upload image → returns Cloudinary URL
router.post('/', upload.single('image'), (req, res) => {
  try {
    res.json({
      url: req.file.path,       // Cloudinary URL
      public_id: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;