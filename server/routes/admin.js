const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const requireAdmin = require('../middleware/adminAuth');

// Every route in this file requires an authenticated admin account.
router.use(requireAdmin);

// GET /api/admin/stats — overview numbers for the dashboard home tab
router.get('/stats', async (req, res) => {
  try {
    const [userCount, adminCount, productCount, carts] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isAdmin: true }),
      Product.countDocuments({}),
      Cart.find({}).populate('items.product'),
    ]);

    const cartsWithItems = carts.filter((c) => c.items.length > 0);
    const totalCartValue = carts.reduce((sum, cart) => {
      return sum + cart.items.reduce((s, item) => s + (item.product ? item.product.price * item.quantity : 0), 0);
    }, 0);

    const categoryBreakdown = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      userCount,
      adminCount,
      productCount,
      activeCartCount: cartsWithItems.length,
      totalCartValue,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — list every registered user (safe fields only, no password hash)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/admin — promote or demote a user's admin status
// Body: { isAdmin: true|false }
router.put('/users/:id/admin', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: "You can't change your own admin status." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: !!req.body.isAdmin },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id — remove a user account (and their cart)
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: "You can't delete your own account from here." });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Cart.deleteOne({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/carts — every user's cart, populated with product + owner details
router.get('/carts', async (req, res) => {
  try {
    const carts = await Cart.find({})
      .populate('items.product')
      .populate('user', 'name email');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
