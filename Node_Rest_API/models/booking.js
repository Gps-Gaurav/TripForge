const mongoose = require('mongoose');

const STATUS_CHOICES = ['pending', 'confirmed', 'cancelled', 'completed'];

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  seat_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true }], // Multiple seats

  booking_time: { type: Date, default: Date.now },
  journey_date: { type: Date, required: true },

  status: { type: String, enum: STATUS_CHOICES, default: 'confirmed' },
  cancelled_at: { type: Date, default: null },
  cancellation_reason: { type: String, default: '' }
}, { collection: 'bookings_booking' });

// Index for sorting
BookingSchema.index({ booking_time: -1 });

// Seat conflict validation (unique per bus+seat+date for confirmed bookings)
BookingSchema.index({ bus_id: 1, seat_ids: 1, journey_date: 1, status: 1 }, { unique: false });

// ⚡ Helper methods
BookingSchema.methods.canCancel = function() {
  return !['cancelled', 'completed'].includes(this.status);
};

BookingSchema.methods.cancelBooking = async function(reason = '') {
  if (!this.canCancel()) throw new Error('This booking cannot be cancelled');
  this.status = 'cancelled';
  this.cancelled_at = new Date();
  this.cancellation_reason = reason;
  await this.save();
  return true;
};

BookingSchema.methods.completeBooking = async function() {
  if (!['confirmed', 'pending'].includes(this.status)) throw new Error('Only confirmed or pending bookings can be completed');
  this.status = 'completed';
  await this.save();
  return true;
};

// ✅ Seat conflict check before saving
BookingSchema.pre('save', async function(next) {
  if (this.status === 'confirmed') {
    const Booking = mongoose.model('Booking');
    const conflicts = await Booking.find({
      _id: { $ne: this._id },
      bus_id: this.bus_id,
      journey_date: this.journey_date,
      seat_ids: { $in: this.seat_ids },
      status: 'confirmed'
    }).select('seat_ids');

    if (conflicts.length > 0) {
      const conflictingSeats = conflicts.flatMap(b => b.seat_ids.map(String));
      return next(new Error(`Seats already booked for ${this.journey_date}: ${[...new Set(conflictingSeats)].join(', ')}`));
    }
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
