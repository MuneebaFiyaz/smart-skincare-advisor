const mongoose = require('mongoose');

// Group-based conflict/synergy matrix, matching compatibility_rules.json.
// Rules are between GROUPS (e.g. "retinoids" vs "aha"), not individual ingredients,
// so one rule automatically covers every ingredient in both groups.
const compatibilityRuleSchema = new mongoose.Schema(
  {
    groupA: { type: String, required: true }, // e.g. "retinoids"
    groupB: { type: String, required: true }, // e.g. "aha"
    severity: {
      type: String,
      enum: ['avoid', 'caution', 'good', 'great', 'essential'],
      required: true,
    },
    reason: { type: String, required: true },
    recommendation: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompatibilityRule', compatibilityRuleSchema);
