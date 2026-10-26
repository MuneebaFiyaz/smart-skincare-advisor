const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // Skincare profile — collected via consultation, editable on the Profile page
    skinType: {
      type: String,
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal', ''],
      default: '',
    },
    concerns: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    budget: { type: Number, default: null },
    fragranceFree: { type: Boolean, default: false },
    veganOnly: { type: Boolean, default: false },

    // Admin dashboard access — false by default for every new signup.
    // The first admin account has to be promoted manually in MongoDB Atlas
    // (Browse Collections > users > edit isAdmin to true) since there's no
    // signup flow that hands this out automatically.
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash the password automatically whenever it's set/changed
userSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never send the password hash back in API responses
userSchema.methods.toSafeObject = function () {
  const { _id, name, email, skinType, concerns, allergies, budget, fragranceFree, veganOnly, isAdmin, createdAt } = this;
  return { id: _id, name, email, skinType, concerns, allergies, budget, fragranceFree, veganOnly, isAdmin, createdAt };
};

module.exports = mongoose.model('User', userSchema);
