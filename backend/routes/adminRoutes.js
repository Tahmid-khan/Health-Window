const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { getSummary } = require('../controllers/adminController');


// Get all users
router.get('/users', adminController.getAllUsers);

// Get all appointments with doctor and patient info
router.get('/appointments', adminController.getAllAppointments);
router.get('/summary', getSummary);
router.get('/stats/monthly-users', adminController.getMonthlyUsers);
router.get('/stats/appointments-trend', adminController.getAppointmentsTrend);


module.exports = router;
