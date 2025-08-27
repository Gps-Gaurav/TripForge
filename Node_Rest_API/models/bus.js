const mongoose = require('mongoose');
const Booking = require('./booking'); // Booking model for availableSeats calculation

const BusSchema = new mongoose.Schema({
  id: { type: Number }, // Django style primary key
  bus_name: { type: String, required: true, maxlength: 100 },
  number: { type: String, required: true, unique: true, maxlength: 20 },
  origin: { type: String, required: true, maxlength: 50 },
  destination: { type: String, required: true, maxlength: 50 },
  features: { type: String, default: '' },
  start_time: { type: String, required: true }, // HH:mm
  reach_time: { type: String, required: true }, // HH:mm
  departure_date: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000) },
  no_of_seats: { type: Number, required: true },
  price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true }
}, 
{ collection: 'bookings_bus' } // ✅ force Django table
);

// Auto update updated_at
BusSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// ---------------------------
// Methods to replicate Django behavior
// ---------------------------

// Return number of available seats for a given journey date
BusSchema.methods.availableSeats = async function(journeyDate) {
  journeyDate = journeyDate || new Date();

  // Find all confirmed bookings for this bus & date
  const bookings = await Booking.find({
    bus_id: this._id,
    journey_date: journeyDate,
    status: 'confirmed'
  }).select('seat_ids');

  // Count booked seats
  const bookedSeats = bookings.flatMap(b => b.seat_ids.map(String));

  // Return max available
  return Math.max(0, this.no_of_seats - bookedSeats.length);
};

// Virtual property: is the bus full today?
BusSchema.virtual('isFullToday').get(async function() {
  return (await this.availableSeats()) <= 0;
});

// ✅ Safe export
module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema, 'bookings_bus');
