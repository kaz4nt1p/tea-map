const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage, getResponsiveImageUrl } = require('../services/cloudinary');
const { globalErrorHandler } = require('../utils/errors');

// Upload single image
router.post('/', async (req, res) => {
  try {
    // Upload image to Cloudinary
    const uploadedFile = await uploadImage(req, res);
    
    if (!uploadedFile) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    // Extract useful information from the uploaded file
    const {
      fieldname,
      originalname,
      encoding,
      mimetype,
      path: secure_url,
      size,
      filename: public_id
    } = uploadedFile;

    // Extract format from mimetype
    const format = mimetype.split('/')[1];
    const resource_type = mimetype.split('/')[0];

    // Generate different sizes for responsive images
    const thumbnailUrl = getResponsiveImageUrl(public_id, 200);
    const mediumUrl = getResponsiveImageUrl(public_id, 600);
    const largeUrl = getResponsiveImageUrl(public_id, 1200);

    // Return the response in the same format as the original upload endpoint
    res.json({
      url: secure_url,
      publicId: public_id,
      filename: originalname,
      size: size,
      type: mimetype,
      thumbnails: {
        small: thumbnailUrl,
        medium: mediumUrl,
        large: largeUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle different types of errors
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB'
      });
    }
    
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        error: 'Only image files are allowed'
      });
    }

    // Handle Cloudinary-specific errors
    if (error.http_code) {
      return res.status(error.http_code).json({
        error: error.message || 'Cloudinary upload failed'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Failed to upload image'
    });
  }
});

// Delete image
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        error: 'Public ID is required'
      });
    }

    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.json({
        message: 'Image deleted successfully',
        publicId
      });
    } else {
      res.status(404).json({
        error: 'Image not found or already deleted'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete image'
    });
  }
});

// Get image with transformations
router.get('/transform/:publicId', (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality, format } = req.query;
    
    if (!publicId) {
      return res.status(400).json({
        error: 'Public ID is required'
      });
    }

    const transformations = {};
    if (width) transformations.width = parseInt(width);
    if (height) transformations.height = parseInt(height);
    if (crop) transformations.crop = crop;
    if (quality) transformations.quality = quality;
    if (format) transformations.format = format;

    const transformedUrl = getResponsiveImageUrl(publicId, transformations.width || 400);
    
    res.json({
      url: transformedUrl,
      publicId,
      transformations
    });

  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({
      error: 'Failed to generate transformed image URL'
    });
  }
});

module.exports = router;