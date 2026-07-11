const express = require('express');
const { createBoarding, getBoardings, deleteBoarding, updateBoarding } = require('../controllers/boardingController');

const router = express.Router();

router.post('/', createBoarding);
router.get('/', getBoardings);
router.delete('/:id', deleteBoarding);
router.put('/:id', updateBoarding);

module.exports = router;
