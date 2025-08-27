const Bus = require('../models/bus');
const Booking = require('../models/booking');
const logger = require('../utils/logger');

// ---------------------------
// List + Create Bus (like BusListCreateView)
// ---------------------------
exports.list = async (req, res) => {
  try {
    let query = {};

    if (req.query.departure) {
      query.origin = { $regex: req.query.departure, $options: 'i' };
    }
    if (req.query.destination) {
      query.destination = { $regex: req.query.destination, $options: 'i' };
    }

    let buses = await Bus.find(query);

    // Filter by journey_date availability
    if (req.query.journey_date) {
      const journey_date = req.query.journey_date;

      // Aggregate bookings count per bus
      const bookedCounts = await Booking.aggregate([
        {
          $match: {
            journey_date,
            status: 'confirmed',
          },
        },
        { $unwind: '$seat_ids' }, // Count seats, not just bookings
        {
          $group: {
            _id: '$bus_id',
            booked_seats_count: { $sum: 1 },
          },
        },
      ]);

      // Get bus IDs that are fully booked
      const fullyBookedIds = [];
      for (const b of bookedCounts) {
        const bus = await Bus.findById(b._id);
        if (bus && bus.no_of_seats <= b.booked_seats_count) {
          fullyBookedIds.push(b._id);
        }
      }

      buses = buses.filter(
        (bus) => !fullyBookedIds.some((id) => id.toString() === bus._id.toString())
      );
    }

    return res.json(buses);
  } catch (e) {
    logger(`List bus error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    return res.status(201).json(bus);
  } catch (e) {
    logger(`Create bus error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};

// ---------------------------
// Bus Detail (like BusDetailView)
// ---------------------------
exports.detail = async (req, res) => {
  try {
    const journey_date = req.query.journey_date;
    const bus = await Bus.findById(req.params.id).populate('seats');

    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // If journey_date provided → mark seats as booked/unbooked
    if (journey_date && bus.seats && bus.seats.length > 0) {
      const bookedSeats = await Booking.find({
        bus_id: bus._id,
        journey_date,
        status: 'confirmed',
      }).distinct('seat_ids');

      bus.seats = bus.seats.map((seat) => {
        const seatObj = seat.toObject();
        seatObj.is_booked = bookedSeats.some(
          (id) => id.toString() === seat._id.toString()
        );
        return seatObj;
      });
    }

    return res.json(bus);
  } catch (e) {
    logger(`Bus detail error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};

// ---------------------------
// Update Bus
// ---------------------------
exports.update = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    return res.json(bus);
  } catch (e) {
    logger(`Update bus error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};

// ---------------------------
// Delete Bus
// ---------------------------
exports.delete = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    return res.json({ message: 'Bus deleted' });
  } catch (e) {
    logger(`Delete bus error: ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
};
