const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    required: true,
    default: 'BeStarz'
  },
  supportEmail: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
