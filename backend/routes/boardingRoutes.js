const express = require('express');
const { createBoarding, getBoardings, deleteBoarding, updateBoarding, getBoardingByName } = require('../controllers/boardingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createBoarding);
router.get('/', getBoardings);
router.get('/name/:name', getBoardingByName);
router.delete('/:id', deleteBoarding);
router.put('/:id', updateBoarding);

module.exports = router;
