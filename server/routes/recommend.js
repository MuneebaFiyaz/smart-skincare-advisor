const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');
const { recommendProducts } = require('../services/recommendationEngine');
const { buildRoutine } = require('../services/compatibilityChecker');

// POST /api/recommend
// Body: { skinType, concerns: [], allergies: [], budget, fragranceFree, veganOnly }
// Returns: recommended products (scored) + a generated 4-step routine + any conflict warnings
router.post('/', async (req, res) => {
  try {
    const { skinType, concerns = [], allergies = [], budget, fragranceFree = false, veganOnly = false } = req.body;

    if (!skinType || typeof budget !== 'number') {
      return res.status(400).json({ error: 'skinType and budget are required' });
    }

    // Save the consultation as a UserProfile (anonymized — no name/email required)
    const profile = await UserProfile.create({
      skinType, concerns, allergies, budget, fragranceFree, veganOnly,
    });

    const allProducts = await Product.find({});
    const scored = recommendProducts(allProducts, profile, 10);
    const routine = await buildRoutine(scored);

    res.json({
      profileId: profile._id,
      recommendations: scored.map((r) => ({
        product: r.product,
        score: r.score,
        reasons: r.reasons,
      })),
      routine,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
