const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  attendee_name: {
    type: String,
    required: [true, 'Attendee name is required'],
    trim: true
  },
  attendee_email: {
    type: String,
    required: [true, 'Attendee email is required'],
    trim: true,
    lowercase: true
  },
  attendee_phone: {
    type: String,
    trim: true
  },
  number_of_tickets: {
    type: Number,
    required: [true, 'Number of tickets is required'],
    min: [1, 'Must book at least 1 ticket']
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  booking_status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  booking_reference: {
    type: String,
    unique: true
  },
  special_requirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Auto-generate booking reference before saving
bookingSchema.pre('save', function() {
  if (!this.booking_reference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.booking_reference = `EVT-${timestamp}-${random}`;
  }
});

// Index for user booking lookups
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
