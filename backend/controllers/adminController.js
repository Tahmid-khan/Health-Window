const db = require('../config/db');

// Get all users
const getAllUsers = (req, res) => {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get all appointments with doctor & patient names
const getAllAppointments = (req, res) => {
  const query = `
  SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    u1.name AS patient_name,
    u2.name AS doctor_name
  FROM appointment a
  JOIN patient p ON a.patient_id = p.patient_id
  JOIN user u1 ON p.patient_id = u1.user_id
  JOIN user u2 ON a.doctor_id = u2.user_id
  ORDER BY a.appointment_date DESC
`;


  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};



// Get dashboard summary
const getSummary = async (req, res) => {
  try {
    const [[{ newUsers }]] = await db.query("SELECT COUNT(*) AS newUsers FROM user WHERE role = 'patient'");
    const [[{ totalAppointments }]] = await db.query("SELECT COUNT(*) AS totalAppointments FROM appointment");
    const [[{ activeDoctors }]] = await db.query("SELECT COUNT(*) AS activeDoctors FROM user WHERE role = 'doctor'");
    const [[{ activePatients }]] = await db.query("SELECT COUNT(*) AS activePatients FROM user WHERE role = 'patient'");

    res.json({ newUsers, totalAppointments, activeDoctors, activePatients });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
};




// Monthly user registrations by month
const getMonthlyUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM user
      GROUP BY month
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Monthly users error:", err);
    res.status(500).json({ message: "Failed to load monthly user stats" });
  }
};

// Monthly appointments by month
const getAppointmentsTrend = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(appointment_date, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM appointment
      GROUP BY month
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Appointments trend error:", err);
    res.status(500).json({ message: "Failed to load appointment stats" });
  }
};


module.exports = {
  getAllUsers,
  getAllAppointments,
  getSummary,  // ✅ this must be here
  getMonthlyUsers,
  getAppointmentsTrend
};