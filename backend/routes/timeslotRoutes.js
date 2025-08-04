const express = require('express');
const router = express.Router();
const { generateTimeSlots } = require('../controllers/timeslotController');

router.post('/generate', generateTimeSlots);

module.exports = router;
