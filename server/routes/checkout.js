const express = require('express');
const Stripe = require('stripe');
const crypto = require('crypto');
const router = express.Router();
const Cart = require('../models/Cart');
const requireAuth = require('../middleware/auth');

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

function getCartItemsHash(cart) {
  const items = cart.items
    .map((item) => [
      String(item.product && item.product._id ? item.product._id : item.product),
      item.quantity,
    ])
    .sort((a, b) => a[0].localeCompare(b[0]));

  return crypto.createHash('sha256').update(JSON.stringify(items)).digest('hex');
}

router.get('/session-status', requireAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured.' });
  }

  const sessionId = req.query.session_id;
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'A valid checkout session is required.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== String(req.userId)) {
      return res.status(404).json({ error: 'Checkout session not found.' });
    }
    if (session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Payment has not been confirmed.' });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (
      cart &&
      String(cart._id) === session.metadata.cartId &&
      getCartItemsHash(cart) === session.metadata.cartItemsHash
    ) {
      cart.items = [];
      await cart.save();
    }

    res.json({ paymentStatus: 'paid', amountTotal: session.amount_total, currency: session.currency });
  } catch (err) {
    console.error('Stripe session verification error:', err);
    res.status(500).json({ error: 'Could not verify the payment. Please contact support if you were charged.' });
  }
});

router.post('/create-session', requireAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file.' });
    }

    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');

    if (!cart || !cart.items.length) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const validItems = cart.items.filter((item) => item.product);
    if (!validItems.length) {
      return res.status(400).json({ error: 'No valid products found in your cart.' });
    }

    const lineItems = validItems.map((item) => ({
      price_data: {
        currency: 'lkr',
        product_data: {
          name: item.product.name,
          images: item.product.imageUrl ? [item.product.imageUrl] : [],
        },
        unit_amount: Math.round(Number(item.product.price) * 100),
      },
      quantity: item.quantity,
    }));

    const baseUrl = process.env.APP_URL || 'http://localhost:5000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/cart.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart.html?checkout=cancelled`,
      metadata: {
        userId: req.userId,
        cartId: String(cart._id),
        cartItemsHash: getCartItemsHash(cart),
        itemCount: String(validItems.length),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session.' });
  }
});

module.exports = router;
