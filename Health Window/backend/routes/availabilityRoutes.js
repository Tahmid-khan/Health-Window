const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.post('/', availabilityController.createAvailability);
router.get('/:doctorId', availabilityController.getAvailabilityByDoctor);

module.exports = router;
