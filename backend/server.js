const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const timeslotRoutes = require('./routes/timeslotRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/timeslot', timeslotRoutes);

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Health Window Backend is Running');
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
