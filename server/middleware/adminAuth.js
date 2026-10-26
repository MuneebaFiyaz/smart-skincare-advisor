const requireAuth = require('./auth');
const User = require('../models/User');

// Chains after requireAuth: confirms the logged-in user is also flagged as an
// admin before letting the request through. Use this (not requireAuth alone)
// on every /api/admin/* route.
async function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required.' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = requireAdmin;
