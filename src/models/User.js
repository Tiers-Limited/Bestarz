const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'provider', 'client'], default: 'client' },
    phone: { type: String },
    profileImage: { type: String },
    isActive: { type: Boolean, default: false },
    lastLogin: { type: Date },

    status: { type: String },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    subscriptionPlan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise', 'none'],
      default: 'none'
    },
    subscriptionStatus: { type: String, enum: ['active', 'canceled', 'expired'], default: 'canceled' },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', userSchema);
