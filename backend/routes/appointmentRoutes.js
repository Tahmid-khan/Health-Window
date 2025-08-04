const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/:userId', appointmentController.getAppointmentsByUser);
// router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
router.get('/user/:userId', appointmentController.getAppointmentsByUser);
router.put('/cancel/:appointmentId', appointmentController.cancelAppointment);




module.exports = router;
