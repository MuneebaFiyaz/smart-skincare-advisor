const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { checkRoutineCompatibility, CONFLICT_SEVERITIES } = require('../services/compatibilityChecker');

// POST /api/compatibility/check
// Body: { productIds: ["...", "..."] }
// Returns: { conflicts: [...], notes: [...], safe: boolean }
//   conflicts = severity "avoid"/"caution" (actual warnings)
//   notes     = severity "essential"/"great"/"good" (reminders + positive synergies)
router.post('/check', async (req, res) => {
  try {
    const { productIds = [] } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'productIds array is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    const matches = await checkRoutineCompatibility(products);

    const conflicts = matches.filter((m) => CONFLICT_SEVERITIES.includes(m.severity));
    const notes = matches.filter((m) => !CONFLICT_SEVERITIES.includes(m.severity));

    res.json({ conflicts, notes, safe: conflicts.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compatibility/rules — list all known rules (conflicts + synergies)
router.get('/rules', async (req, res) => {
  try {
    const CompatibilityRule = require('../models/CompatibilityRule');
    const rules = await CompatibilityRule.find({});
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compatibility/groups — list all ingredient groups (for reference/debugging)
router.get('/groups', async (req, res) => {
  try {
    const IngredientGroup = require('../models/IngredientGroup');
    const groups = await IngredientGroup.find({});
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
