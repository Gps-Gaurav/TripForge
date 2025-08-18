const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const busController = require('../controllers/busController');
const bookingController = require('../controllers/bookingController');
const userController = require('../controllers/userController');

// Middlewares (JWT authentication)
const auth = require('../middlewares/auth');

// Bus list & create
router.get('/buses', auth, busController.list);
router.post('/buses', auth, busController.create);

// Bus detail/update/delete
router.get('/buses/:id', auth, busController.detail);
router.put('/buses/:id', auth, busController.update);
router.delete('/buses/:id', auth, busController.delete);

// User registration & login
router.post('/register', authController.register);
router.post('/login', authController.login);

// User bookings (list)
router.get('/user/:user_id/bookings', auth, bookingController.userBookings);

// Booking create
router.post('/booking', auth, bookingController.create);

// User booking stats
router.get('/user/:user_id/booking-stats', auth, userController.bookingStats);

// Booking cancel
router.post('/bookings/:booking_id/cancel', auth, bookingController.cancel);

module.exports = router;