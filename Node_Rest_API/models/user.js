const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: String,
  last_name: String,
  is_superuser: { type: Boolean, default: false },
  is_staff: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  date_joined: { type: Date, default: Date.now }
}, 
  { collection: 'auth_user' } // ✅ force Django collection
);

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Safe export (avoid creating new "users")
module.exports = mongoose.models.User || mongoose.model('User', UserSchema, 'auth_user');
