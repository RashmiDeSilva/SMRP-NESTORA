const express = require('express');
const { registerUser, loginUser, toggleSavedBoarding, getSavedBoardings } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);

// Persist saved boardings
router.post('/saved', protect, toggleSavedBoarding);
router.get('/saved', protect, getSavedBoardings);

module.exports = router;
