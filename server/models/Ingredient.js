const mongoose = require('mongoose');

// Matches the columns in server/seed/data/ingredients.csv.
// Semicolon-separated CSV fields (skinTypes, concerns, category, pairsWellWith,
// avoidWith) are stored as arrays for easy querying.
const ingredientSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // e.g. "azelaic-acid" (CSV "id" column)
    inciName: { type: String, required: true },
    commonName: { type: String, required: true },
    alsoKnownAs: { type: [String], default: [] },
    category: { type: [String], default: [] }, // e.g. ["Exfoliant", "Skin-brightening"]
    description: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    skinTypes: { type: [String], default: [] },
    concerns: { type: [String], default: [] },
    comedogenicRating: { type: Number, default: null }, // 0-5 scale
    irritancy: { type: String, enum: ['low', 'medium', 'high', ''], default: '' },
    pregnancySafe: { type: String, enum: ['safe', 'caution', 'avoid', ''], default: '' },
    vegan: { type: Boolean, default: true },
    origin: { type: String, enum: ['natural', 'synthetic', 'both', ''], default: '' },
    typicalConcentration: { type: String, default: '' }, // free-text range, e.g. "5-20%"
    phRange: { type: String, default: '' },
    timeOfUse: { type: String, default: '' }, // "AM", "PM", or "AM/PM"
    evidenceLevel: { type: String, enum: ['limited', 'moderate', 'strong', ''], default: '' },
    pairsWellWith: { type: [String], default: [] }, // free-text ingredient names from CSV
    avoidWith: { type: [String], default: [] }, // free-text ingredient names from CSV
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
