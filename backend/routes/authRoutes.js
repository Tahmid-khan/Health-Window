const express = require('express');
const router = express.Router();

const { 
  registerUser,
  loginUser,
  getUserById,
  registerDoctor,
  getAllDoctors
} = require('../controllers/authController');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUserById);
router.post('/register-doctor', registerDoctor); 
router.get('/doctors', getAllDoctors);


module.exports = router;
