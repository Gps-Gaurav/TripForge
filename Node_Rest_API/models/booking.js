const mongoose = require('mongoose');

const STATUS_CHOICES = ['pending', 'confirmed', 'cancelled', 'completed'];

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  booking_time: { type: Date, default: Date.now },
  status: { type: String, enum: STATUS_CHOICES, default: 'confirmed' },
  cancelled_at: { type: Date, default: null },
  cancellation_reason: { type: String, default: '' }
});

// Latest bookings first
BookingSchema.index({ booking_time: -1 });

// Unique constraints
BookingSchema.index({ bus: 1, seat: 1, status: 1 }, { unique: true });

// Virtual properties and methods
BookingSchema.virtual('can_cancel').get(function() {
  return !['cancelled', 'completed'].includes(this.status);
});

BookingSchema.methods.cancel_booking = async function(reason = '') {
  if (!this.can_cancel) throw new Error("This booking cannot be cancelled");
  this.status = 'cancelled';
  this.cancelled_at = Date.now();
  this.cancellation_reason = reason;
  if (this.seat) {
    await this.seat.cancel();
  }
  await this.save();
  return true;
};

BookingSchema.methods.complete_booking = async function() {
  if (!['confirmed', 'pending'].includes(this.status)) {
    throw new Error("Only confirmed or pending bookings can be completed");
  }
  this.status = 'completed';
  await this.save();
  return true;
};

module.exports = {
  Booking: mongoose.model('Booking', BookingSchema)
};