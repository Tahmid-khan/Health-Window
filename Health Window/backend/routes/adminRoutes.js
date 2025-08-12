const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


console.log("✅ Admin routes loaded");



// Admin login (usually in authRoutes, but placing here as requested)
router.post('/login', adminController.login);

// Admin dashboard stats (doctors, patients, appointments count)
router.get('/stats', adminController.getDashboardStats);

// Doctors
router.get('/doctors', adminController.getDoctors);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Patients
router.get('/patients', adminController.getPatients);
router.delete('/patients/:id', adminController.deletePatient);

// Appointments
router.get('/appointments', adminController.getAppointments);
router.delete('/appointments/:id', adminController.deleteAppointment);




module.exports = router;
