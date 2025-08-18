const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed!
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
});

module.exports = {
  User: mongoose.model('User', UserSchema)
};