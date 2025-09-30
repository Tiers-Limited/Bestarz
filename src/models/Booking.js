const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    provider: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Provider', 
      required: true 
    },
    
    serviceCategory: { type: String, required: true },
    eventType: { type: String, required: true },
    location: { type: String, required: true },
    guests: { type: Number, required: true },
    
    dateStart: { type: Date, required: true },
    dateEnd: { type: Date },
    eventTime: { type: String, required: true },
    duration: { type: String },
    
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    
    // Final confirmed amount set by provider
    amount: { type: Number },
    
    description: { type: String },
    contactInfo: {
		phone: { type: String },
		email: { type: String }
	},
    
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'advance_pending', 'advance_paid', 'final_pending', 'final_paid', 'refunded'],
      default: 'unpaid'
    },
    
    // Track which payments have been made
    advancePaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    finalPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes for faster queries
bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ dateStart: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);