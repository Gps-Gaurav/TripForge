const mongoose = require('mongoose');
const Booking = require('./booking'); // Booking model for availability check

const SeatSchema = new mongoose.Schema({
  id: { type: Number }, // Django seat PK
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  seat_number: { type: String, required: true, maxlength: 10 }
}, 
{ collection: 'bookings_seat' });

// Unique seat_number per bus
SeatSchema.index({ bus_id: 1, seat_number: 1 }, { unique: true });

// Check if seat is available for a given journey date
SeatSchema.methods.isAvailable = async function(journeyDate) {
  const conflict = await Booking.findOne({
    bus_id: this.bus_id,
    journey_date: journeyDate,
    seat_ids: this._id,
    status: 'confirmed'
  });
  return !conflict;
};

// Optional: helper methods for quick book/cancel (date-unaware)
SeatSchema.methods.book = async function(userId) {
  // This is simple "last booked" tracker, not date-specific
  this.is_booked = true;
  this.last_booked_at = new Date();
  this.last_booked_by = userId;
  await this.save();
  return true;
};

SeatSchema.methods.cancel = async function() {
  this.is_booked = false;
  this.last_booked_at = null;
  this.last_booked_by = null;
  await this.save();
  return true;
};

// ✅ Safe export
module.exports = mongoose.models.Seat || mongoose.model('Seat', SeatSchema, 'bookings_seat');
