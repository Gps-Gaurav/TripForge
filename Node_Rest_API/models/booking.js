const mongoose = require('mongoose');

const STATUS_CHOICES = ['pending', 'confirmed', 'cancelled', 'completed'];

const BookingSchema = new mongoose.Schema({
  id: { type: Number }, // Django-style id
  user_id: { type: Number, required: true },  // Django me usually int foreign key hota hai
  bus_id: { type: Number, required: true },
  seat_id: { type: Number, required: true },

  booking_time: { type: Date, default: Date.now },
  status: { type: String, enum: STATUS_CHOICES, default: 'confirmed' },
  cancelled_at: { type: Date, default: null },
  cancellation_reason: { type: String, default: '' }
},
  { collection: 'bookings_booking' }  // ✅ force to use Django collection
);

// Index for sorting
BookingSchema.index({ booking_time: -1 });

// Unique constraints like Django
BookingSchema.index({ bus_id: 1, seat_id: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema, 'bookings_booking');
