import mongoose from 'mongoose';

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

export default mongoose.model('PlatformSettings', platformSettingsSchema);