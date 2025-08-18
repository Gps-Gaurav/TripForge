const Booking  = require('../models/booking');
const logger = require('../utils/logger');

exports.bookingStats = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (req.user.id !== userId) return res.status(401).json({ error: 'Unauthorized' });
    const now = new Date();
    const total_bookings = await Booking.countDocuments({ user: userId });
    const active_bookings = await Booking.countDocuments({ user: userId, status: 'confirmed', bus: { $exists: true } });
    const past_bookings = await Booking.countDocuments({ user: userId, status: 'confirmed', bus: { $exists: true } });
    const cancelled_bookings = await Booking.countDocuments({ user: userId, status: 'cancelled' });
    return res.json({
      total_bookings,
      active_bookings,
      past_bookings,
      cancelled_bookings
    });
  } catch (e) {
    logger(`Booking stats error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};