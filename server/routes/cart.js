const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const requireAuth = require('../middleware/auth');

// All cart routes require a logged-in user
router.use(requireAuth);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// GET /api/cart — current user's cart
router.get('/', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add   Body: { productId, quantity }
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cart = await getOrCreateCart(req.userId);

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/cart/item/:productId   Body: { quantity } — update quantity directly
router.put('/item/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.userId);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cart/item/:productId
router.delete('/item/:productId', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
