const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ paidAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Could not load order history:', err);
    res.status(500).json({ error: 'Could not load your order history.' });
  }
});

module.exports = router;
