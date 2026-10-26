const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

// All routes here require a logged-in user
router.use(requireAuth);

// GET /api/profile — current user's full profile (account + skincare info)
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile — update skincare profile fields (used by Profile page)
// Body: { skinType, concerns, allergies, budget, fragranceFree, veganOnly }
router.put('/', async (req, res) => {
  try {
    const { skinType, concerns, allergies, budget, fragranceFree, veganOnly } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (skinType !== undefined) user.skinType = skinType;
    if (concerns !== undefined) user.concerns = concerns;
    if (allergies !== undefined) user.allergies = allergies;
    if (budget !== undefined) user.budget = budget;
    if (fragranceFree !== undefined) user.fragranceFree = fragranceFree;
    if (veganOnly !== undefined) user.veganOnly = veganOnly;

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/profile/account — update name/email (used by Settings page)
router.put('/account', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'That email is already in use' });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/profile/password — change password (used by Settings page)
// Body: { currentPassword, newPassword }
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    await user.setPassword(newPassword);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/profile — delete account (used by Settings page)
router.delete('/', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
