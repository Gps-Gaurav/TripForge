const mongoose = require('mongoose');
const Bus = require('../models/bus');
const Seat = require('../models/seat');
const Booking = require('../models/booking');
const logger = require('../utils/logger');

// Make sure you have authentication middleware: req.user set by JWT

// ---------------------------
// Create Booking (similar to BookingView.post)
// ---------------------------
exports.create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { bus_id, seat_ids, journey_date } = req.body;

    if (!bus_id || !seat_ids || !journey_date) {
      return res.status(400).json({ error: 'bus_id, seat_ids and journey_date are required' });
    }

    // 1. Check bus exists
    const bus = await Bus.findById(bus_id).session(session);
    if (!bus) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Invalid bus' });
    }

    // 2. Validate all seats
    const seats = await Seat.find({ _id: { $in: seat_ids }, bus_id }).session(session);
    if (seats.length !== seat_ids.length) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'One or more seats invalid for this bus' });
    }

    // 3. Check seat conflicts (only confirmed bookings matter)
    const conflict = await Booking.findOne({
      bus_id,
      journey_date,
      seat_ids: { $in: seat_ids },
      status: 'confirmed'
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'One or more seats already booked for this date' });
    }

    // 4. Create booking
    const booking = new Booking({
      user: userId,
      bus_id,
      seat_ids,
      journey_date,
      status: 'confirmed'
    });
    await booking.save({ session });

    await session.commitTransaction();
    return res.status(201).json(booking);

  } catch (e) {
    await session.abortTransaction();
    logger(`Booking create error: ${e.message}`);
    return res.status(400).json({ detail: 'Booking failed', error: e.message });
  } finally {
    session.endSession();
  }
};

// ---------------------------
// User Booking List (like UserBookingView.get)
// ---------------------------
exports.userBookings = async (req, res) => {
  try {
    const userId = req.params.user_id;

    if (req.user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = { user: userId };
    if (req.query.status) query.status = req.query.status;

    const bookings = await Booking.find(query)
      .sort('-booking_time')
      .populate('bus_id seat_ids');

    return res.json(bookings);

  } catch (e) {
    logger(`User bookings error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};

// ---------------------------
// Cancel Booking (like CancelBookingView.post)
// ---------------------------
exports.cancel = async (req, res) => {
  try {
    const bookingId = req.params.booking_id;

    const booking = await Booking.findById(bookingId).populate('seat_ids');
    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized' });
    }

    if (!booking.canCancel()) {
      return res.status(400).json({ detail: 'Booking cannot be cancelled' });
    }

    // Cancel booking
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    booking.cancellation_reason = req.body.reason || 'Cancelled by user';
    await booking.save();

    return res.json({
      detail: 'Booking cancelled successfully',
      booking_id: booking._id,
      status: booking.status,
      cancelled_at: booking.cancelled_at
    });

  } catch (e) {
    logger(`Cancel booking error: ${e.message}`);
    return res.status(500).json({ detail: e.message });
  }
};

// ---------------------------
// Booking Stats (optional helper like DRF analytics)
// ---------------------------
exports.stats = async (req, res) => {
  try {
    const userId = req.params.user_id;
    if (req.user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    const bookings = await Booking.find({ user: userId }).populate('bus_id');

    const stats = {
      total_bookings: bookings.length,
      active_bookings: bookings.filter(
        b => b.status === 'confirmed' && b.bus_id.departure_date > now
      ).length,
      cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
      past_bookings: bookings.filter(
        b => b.status === 'confirmed' && b.bus_id.departure_date < now
      ).length,
    };

    return res.json(stats);

  } catch (e) {
    logger(`Booking stats error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};
