const mongoose = require('mongoose');
const { Bus } = require('../models/bus');
const { Seat } = require('../models/seat');
const { Booking } = require('../models/booking');
const logger = require('../utils/logger');

// You should have an auth middleware to set req.user from JWT

exports.stats = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (req.user.id !== userId) return res.status(401).json({ error: 'Unauthorized' });
    const now = new Date();
    const bookings = await Booking.find({ user: userId }).populate('bus');
    const stats = {
      total_bookings: bookings.length,
      active_bookings: bookings.filter(b => b.status === 'confirmed' && b.bus.departure_date > now).length,
      cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
      past_bookings: bookings.filter(b => b.status === 'confirmed' && b.bus.departure_date < now).length,
    };
    return res.json(stats);
  } catch (e) {
    logger(`Booking stats error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const { bus: busId, seat: seatId } = req.body;
    if (!busId || !seatId) return res.status(400).json({ error: 'Bus and seat are required' });
    const bus = await Bus.findById(busId);
    const seat = await Seat.findOne({ _id: seatId, bus: busId }).session(session);
    if (!bus || !seat) return res.status(404).json({ error: 'Invalid bus or seat' });
    if (seat.is_booked) return res.status(400).json({ error: 'Seat already booked' });
    const booking = await Booking.create([{
      user: userId,
      bus: busId,
      seat: seatId,
      status: 'confirmed'
    }], { session });
    seat.is_booked = true;
    seat.last_booked_at = new Date();
    seat.last_booked_by = userId;
    await seat.save({ session });
    await session.commitTransaction();
    return res.status(201).json(booking[0]);
  } catch (e) {
    await session.abortTransaction();
    logger(`Booking error: ${e.message}`);
    return res.status(500).json({ error: `Failed: ${e.message}` });
  } finally {
    session.endSession();
  }
};

exports.userBookings = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (req.user.id !== userId) return res.status(401).json({ error: 'Unauthorized' });
    let query = { user: userId };
    if (req.query.status) query.status = req.query.status;
    const bookings = await Booking.find(query).sort('-booking_time').populate('bus seat');
    return res.json(bookings);
  } catch (e) {
    logger(`User bookings error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.cancel = async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const booking = await Booking.findById(bookingId).populate('seat');
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ detail: 'Not authorized' });
    if (!booking.can_cancel) return res.status(400).json({ detail: 'Cannot cancel this booking' });
    if (booking.seat) await booking.seat.cancel();
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    booking.cancellation_reason = req.body.reason || 'Cancelled by user';
    await booking.save();
    return res.json({ detail: 'Booking cancelled successfully', booking_id: bookingId });
  } catch (e) {
    logger(`Cancel booking error: ${e.message}`);
    return res.status(500).json({ detail: e.message });
  }
};