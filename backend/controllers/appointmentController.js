const db = require('../config/db');

// Create a new appointment
const createAppointment = async (req, res) => {
  console.log("Received:", req.body);

  const {
    user_id,
    doctor_id,
    appointment_date,
    appointment_time,
    status,
    notes
  } = req.body;

  // Validate input
  if (
    !user_id ||
    !doctor_id ||
    !appointment_date ||
    !appointment_time 
  ) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }
  const finalStatus = status || 'booked';
  const finalNotes = notes || '';
  try {
    console.log('Creating appointment with:', req.body);

    const [result] = await db.query(
      `INSERT INTO appointment 
        (user_id, doctor_id, appointment_date, appointment_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, doctor_id, appointment_date, appointment_time, finalStatus, finalNotes]
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: result.insertId
    });
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all appointments for a user (patient or doctor)
const getAppointmentsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [appointments] = await db.query(
      `SELECT 
         a.appointment_id,
         a.doctor_id,
         a.appointment_date,
         a.appointment_time,
         a.status,
         a.notes,
         u1.name AS patient_name,
         u2.name AS doctor_name
       FROM appointment a
       JOIN user u1 ON a.user_id = u1.user_id         -- Patient info
       JOIN user u2 ON a.doctor_id = u2.user_id       -- Doctor info
       WHERE a.user_id = ? OR a.doctor_id = ?
       ORDER BY a.appointment_date DESC`,
      [userId, userId]
    );

    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};





// Define functions normally first
const getAppointmentsByPatient = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(`
      SELECT a.*, d.name AS doctor_name
      FROM appointment a
      JOIN user d ON a.doctor_id = d.user_id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { role } = req.body;

  try {
    const status = role === 'doctor' ? 'cancelled_by_doctor' : 'cancelled_by_patient';

    await db.query('UPDATE appointment SET status = ? WHERE appointment_id = ?', [status, appointmentId]);

    res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};


// Export all at once at the bottom
module.exports = {
  createAppointment,
  getAppointmentsByUser,
  getAppointmentsByPatient,
  cancelAppointment
};


