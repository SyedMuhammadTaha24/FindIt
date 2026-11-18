const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folder if it does not exist
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get the logged-in user's id, whatever name the auth middleware used
function getRequesterId(req) {
  const user = req.user || {};
  return String(user.id || user._id || user.userId || '');
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname).toLowerCase()
    );
  }
});

// Image upload configuration
const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed.'));
    }
  }
});

// GET: Fetch all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 }).lean();

    const safeItems = items.map(item => ({
      ...item,
      reporterPhone: item.showContact
        ? item.reporterPhone
        : ''
    }));

    res.json(safeItems);

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching items',
      error: error.message
    });
  }
});

// POST: Add item with optional image (login required)
router.post('/', auth, (req, res, next) => {

  upload.single('image')(req, res, (error) => {

    if (error) {
      return res.status(400).json({
        message: 'Image upload failed',
        error: error.message
      });
    }

    next();
  });

}, async (req, res) => {
  try {
    const {
      name,
      category,
      location,
      description,
      status,
      reporterName,
      reporterPhone,
      showContact
    } = req.body;

    const ownerId = getRequesterId(req);

    if (!ownerId) {
      // Could not work out who the logged-in user is
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(401).json({
        message: 'Could not identify the logged-in user. Please login again.'
      });
    }

    // Create new item
    const newItem = new Item({
      name,
      category,
      location,
      description,
      status,
      reporterName,
      reporterPhone,
      showContact:
        showContact === 'true' || showContact === true,

      image: req.file
        ? `/uploads/${req.file.filename}`
        : '',

      // Owner of this report
      user: ownerId
    });

    // Save item in MongoDB
    const savedItem = await newItem.save();

    const safeItem = savedItem.toObject();

    // Hide phone number if contact sharing is disabled
    if (!safeItem.showContact) {
      safeItem.reporterPhone = '';
    }

    res.status(201).json(safeItem);

  } catch (error) {

    // Remove uploaded image if database saving fails
    if (req.file) {
      fs.unlink(
        req.file.path,
        () => {}
      );
    }

    res.status(400).json({
      message: 'Error adding item',
      error: error.message
    });
  }
});

// DELETE: Remove an item (only the owner can do this)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    const requesterId = getRequesterId(req);

    if (!item.user || !requesterId || String(item.user) !== requesterId) {
      return res.status(403).json({
        message: 'You can only delete your own report'
      });
    }

    // Delete the image file from uploads folder
    if (item.image) {
      const imagePath = path.join(
        uploadDir,
        path.basename(item.image)
      );

      fs.unlink(imagePath, () => {});
    }

    await item.deleteOne();

    res.json({
      message: 'Report deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error deleting report',
      error: error.message
    });
  }
});

module.exports = router;