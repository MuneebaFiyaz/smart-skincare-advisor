const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true }, // in LKR
    category: {
      type: String,
      required: true,
      enum: ['cleanser', 'treatment', 'moisturizer', 'sunscreen'],
    },
    ingredients: { type: [String], required: true, default: [] },
    suitableSkinTypes: { type: [String], default: [] },
    targetsConcerns: { type: [String], default: [] },
    fragranceFree: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
