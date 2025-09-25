const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/user');

require('dotenv').config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Single Cloudinary storage for all uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'app_uploads', // single folder for all uploads
      resource_type: 'auto', // auto-detect type (image, video, raw)
      type: 'upload',
    };
  },
});

const parser = multer({ storage: storage });

// ----------------- Routes -----------------

// Generic file upload (image, video, document)
// Generic file upload (image, video, document)
router.post('/upload', parser.single('file'), async (req, res) => {
  try {
    // Check if multer provided a file
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    console.log('Upload started:', req.file);

    // CloudinaryStorage automatically uploads to Cloudinary
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: req.file.path,       // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public ID
    });

  } catch (err) {
    console.error('Upload error:', err);

    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: err.message || 'Unknown error',
    });
  }
});

// Update existing file by public_id
router.put('/update/:public_id', parser.single('file'), async (req, res) => {
  const publicId = req.params.public_id;

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    // Since multer-storage-cloudinary stores directly in Cloudinary,
    // req.file.path is already a Cloudinary URL. 
    // To update without creating a new version, use public_id directly.
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `app_uploads/${publicId}`,
      resource_type: 'auto',
      overwrite: true, // ensures existing file is replaced
      invalidate: true, // optional: invalidates CDN cache
    });

    res.json({
      message: 'File updated successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File update failed', error: err.message });
  }
});


// Upload profile picture and update user
router.post('/upload-profile', parser.single('profileImage'), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const updatedUser = await User.findOneAndUpdate(
      { uuid: userId },
      { userImage: req.file.path },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile image uploaded successfully',
      userId: updatedUser.uuid,
      username: updatedUser.username,
      userImage: updatedUser.userImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile image upload failed', error: err.message });
  }
});

// Get file URL by public_id
router.get('/file/:public_id', async (req, res) => {
  try {
    const publicId = `app_uploads/${req.params.public_id}`;

    // Get file type from query parameter, default to 'auto' if not provided
    const resourceType = req.query.type || 'auto'; // 'image', 'video', 'raw', or 'auto'

    // Generate versionless URL with dynamic resource type
    const url = cloudinary.url(publicId, { resource_type: resourceType});

    console.log(url);

    res.json({
      message: 'File fetched successfully',
      url,
      public_id: publicId,
      resource_type: resourceType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch file', error: err.message });
  }
});

module.exports = router;
