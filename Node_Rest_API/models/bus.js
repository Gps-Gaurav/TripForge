const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  id: { type: Number }, // Django style primary key
  bus_name: { type: String, required: true, maxlength: 100 },
  number: { type: String, required: true, unique: true, maxlength: 20 },
  origin: { type: String, required: true, maxlength: 50 },
  destination: { type: String, required: true, maxlength: 50 },
  features: { type: String },
  start_time: { type: String, required: true }, // HH:mm
  reach_time: { type: String, required: true }, // HH:mm
  departure_date: { type: Date, default: () => Date.now() + 24*60*60*1000 },
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

// ✅ Safe export (avoid duplicate model + force collection name)
module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema, 'bookings_bus');
