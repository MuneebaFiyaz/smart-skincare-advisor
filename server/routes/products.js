const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const Product = require('../models/Product');
const requireAdmin = require('../middleware/adminAuth');

const productImageDir = path.join(__dirname, '..', '..', 'images', 'products');
const imageTypes = {
  'image/jpeg': { extension: 'jpg', matches: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  'image/png': { extension: 'png', matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { extension: 'webp', matches: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' },
};
const parseProductImage = express.raw({ type: Object.keys(imageTypes), limit: '5mb' });

// GET /api/products  — list/browse with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = {};
    const search = (req.query.search || '').trim();

    if (req.query.category) filter.category = req.query.category;
    if (req.query.skinType) filter.suitableSkinTypes = req.query.skinType;
    if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { ingredients: new RegExp(search, 'i') },
      ];
    }

    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — product detail page
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — add a product (used by the admin dashboard)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id — update any field on a product (image manager, admin edits)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/products/:id/image — upload and replace a product image
router.post(
  '/:id/image',
  requireAdmin,
  (req, res, next) => {
    parseProductImage(req, res, (err) => {
      if (!err) return next();
      if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Image must be 5 MB or smaller.' });
      }
      next(err);
    });
  },
  async (req, res) => {
    const mimeType = (req.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const imageType = imageTypes[mimeType];
    const imageBuffer = req.body;

    if (!imageType || !Buffer.isBuffer(imageBuffer) || !imageBuffer.length) {
      return res.status(400).json({ error: 'Choose a JPG, PNG, or WebP image.' });
    }
    if (!imageType.matches(imageBuffer)) {
      return res.status(400).json({ error: 'The uploaded file does not match its image type.' });
    }

    let imagePath;
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const filename = `product-${crypto.randomBytes(16).toString('hex')}.${imageType.extension}`;
      imagePath = path.join(productImageDir, filename);
      await fs.mkdir(productImageDir, { recursive: true });
      await fs.writeFile(imagePath, imageBuffer, { flag: 'wx' });

      product.imageUrl = `/images/products/${filename}`;
      await product.save();
      res.json({ imageUrl: product.imageUrl, name: product.name });
    } catch (err) {
      if (imagePath) {
        try {
          await fs.unlink(imagePath);
        } catch (cleanupErr) {
          if (cleanupErr.code !== 'ENOENT') console.error('Could not remove failed product image upload:', cleanupErr);
        }
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/products/:id — admin dashboard only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
