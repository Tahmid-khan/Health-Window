const db = require('../config/db');

// POST /api/availability
const createAvailability = async (req, res) => {
  const { doctor_id, available_date, start_time, end_time } = req.body;

  if (!doctor_id || !available_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO availability (doctor_id, available_date, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [doctor_id, available_date, start_time, end_time]
    );

    res.status(201).json({
      message: 'Availability added',
      availabilityId: result.insertId
    });
  } catch (err) {
    console.error('Create availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/availability/:doctorId
const getAvailabilityByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM availability WHERE doctor_id = ? ORDER BY available_date, start_time`,
      [doctorId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Fetch availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAvailability,
  getAvailabilityByDoctor
};
