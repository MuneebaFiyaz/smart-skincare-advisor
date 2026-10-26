const mongoose = require('mongoose');

// Stores each group from compatibility_rules.json, e.g.
// { key: "retinoids", ingredientSlugs: ["retinol", "retinaldehyde", "adapalene", ...] }
// Used to resolve "which group(s) does this ingredient belong to?" when checking a routine.
const ingredientGroupSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "retinoids"
    ingredientSlugs: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IngredientGroup', ingredientGroupSchema);
