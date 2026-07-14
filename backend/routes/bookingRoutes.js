const express = require('express');
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
