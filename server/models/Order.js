const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unitAmount: { type: Number, required: true },
    quantity: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    checkoutSessionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['paid'], default: 'paid', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true },
    paidAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
