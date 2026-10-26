const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    skinType: {
      type: String,
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'],
      required: true,
    },
    concerns: { type: [String], default: [] }, // e.g. ["acne", "aging"]
    allergies: { type: [String], default: [] }, // ingredient names to avoid
    budget: { type: Number, required: true }, // max spend in LKR
    fragranceFree: { type: Boolean, default: false },
    veganOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
