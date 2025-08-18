const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
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
});

// Update updated_at automatically
BusSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = {
  Bus: mongoose.model('Bus', BusSchema)
};