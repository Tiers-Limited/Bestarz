import mongoose from 'mongoose';

const rateCardSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  includes: [{
    type: String
  }],
});

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    trim: true
  }],
  basePrice: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  portfolio: [{
    type: String,
  
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  availability: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  rateCards: [rateCardSchema],
  
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
providerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure slug is unique
providerSchema.pre('save', async function(next) {
  if (this.isModified('businessName') && !this.slug) {
    let baseSlug = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

export default mongoose.model('Provider', providerSchema);