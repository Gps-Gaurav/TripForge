const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  id: { type: Number }, // Django seat primary key

  bus_id: { type: Number, required: true },  // Django foreign key (Bus ka int ID)
  seat_number: { type: String, required: true, maxlength: 10 },
  is_booked: { type: Boolean, default: false },
  last_booked_at: { type: Date, default: null },
  last_booked_by: { type: Number, default: null } // Django user ka int ID
}, 
  { collection: 'bookings_seat' } // ✅ force Django collection
);

// Unique seat_number per bus
SeatSchema.index({ bus_id: 1, seat_number: 1 }, { unique: true });

// Instance method: book
SeatSchema.methods.book = async function(userId) {
  if (!this.is_booked) {
    this.is_booked = true;
    this.last_booked_at = Date.now();
    this.last_booked_by = userId;
    await this.save();
    return true;
  }
  return false;
};

// Instance method: cancel
SeatSchema.methods.cancel = async function() {
  this.is_booked = false;
  this.last_booked_at = null;
  this.last_booked_by = null;
  await this.save();
  return true;
};

// ✅ Safe export (avoid creating new "seats" collection)
module.exports = mongoose.models.Seat || mongoose.model('Seat', SeatSchema, 'bookings_seat');
