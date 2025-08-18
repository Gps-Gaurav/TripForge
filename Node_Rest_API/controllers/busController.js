const Bus  = require('../models/bus');
const logger = require('../utils/logger');

exports.list = async (req, res) => {
  try {
    let query = {};
    if (req.query.departure) query.origin = { $regex: req.query.departure, $options: 'i' };
    if (req.query.destination) query.destination = { $regex: req.query.destination, $options: 'i' };
    if (req.query.date) query.departure_date = req.query.date;
    const buses = await Bus.find(query);
    return res.json(buses);
  } catch (e) {
    logger(`List bus error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.create = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    return res.status(201).json(bus);
  } catch (e) {
    logger(`Create bus error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.detail = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    return res.json(bus);
  } catch (e) {
    logger(`Bus detail error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.update = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    return res.json(bus);
  } catch (e) {
    logger(`Update bus error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};

exports.delete = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    return res.json({ message: "Bus deleted" });
  } catch (e) {
    logger(`Delete bus error: ${e.message}`);
    return res.status(500).json({ error: `Error: ${e.message}` });
  }
};