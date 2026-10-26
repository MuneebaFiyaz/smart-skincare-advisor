const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
  {
    userProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
    steps: [
      {
        step: {
          type: String,
          enum: ['cleanser', 'treatment', 'moisturizer', 'sunscreen'],
        },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      },
    ],
    warnings: [
      {
        ingredientA: String,
        ingredientB: String,
        riskLevel: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Routine', routineSchema);
