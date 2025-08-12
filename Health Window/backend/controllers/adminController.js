const pool = require('../config/db');   
const bcrypt = require('bcryptjs');

// Admin Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin account' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash); // Match column name!

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Success
    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [[doctorCount]] = await pool.query('SELECT COUNT(*) AS count FROM user WHERE role = "doctor"');
    const [[patientCount]] = await pool.query('SELECT COUNT(*) AS count FROM user WHERE role = "patient"');
    const [[appointmentCount]] = await pool.query('SELECT COUNT(*) AS count FROM appointment');

    res.json({
      doctors: doctorCount.count,
      patients: patientCount.count,
      appointments: appointmentCount.count
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
};





// GET /api/admin/doctors?search=...
exports.getDoctors = async (req, res) => {
  const { search = '' } = req.query;
  const like = `%${search.trim()}%`;

  const where = search
    ? `WHERE u.role = 'doctor' AND (
         u.name LIKE ? OR u.email LIKE ?
         OR COALESCE(s.name, '') LIKE ?
         OR COALESCE(d.qualification, '') LIKE ?
         OR COALESCE(d.medical_license_number, '') LIKE ?
       )`
    : `WHERE u.role = 'doctor'`;

  const sql = `
    SELECT
      u.user_id AS id,
      u.name,
      u.email,
      COALESCE(s.name, '')            AS specialty,
      COALESCE(d.qualification, '')   AS qualification,
      COALESCE(d.experience_years, 0) AS experience_years,
      CASE
        WHEN d.medical_license_number IS NOT NULL AND d.medical_license_number <> '' THEN 'Approved'
        ELSE 'Pending'
      END AS status
    FROM user u
    LEFT JOIN doctor d     ON d.user_id = u.user_id
    LEFT JOIN specialty s  ON s.specialty_id = d.specialty   -- ✅ correct join
    ${where}
    ORDER BY u.created_at DESC
  `;

  try {
    const params = search ? [like, like, like, like, like] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('getDoctors error:', err);
    res.status(500).json({ message: 'Failed to load doctors' });
  }
};

// DELETE /api/admin/doctors/:id
exports.deleteDoctor = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid doctor id' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM appointment  WHERE doctor_id = ?`, [id]);
    await conn.query(`DELETE FROM timeslot     WHERE doctor_id = ?`, [id]);
    await conn.query(`DELETE FROM availability WHERE doctor_id = ?`, [id]);
    await conn.query(`DELETE FROM doctor WHERE user_id = ?`, [id]);

    const [result] = await conn.query(
      `DELETE FROM user WHERE user_id = ? AND role = 'doctor'`,
      [id]
    );

    await conn.commit();

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (e) {
    await conn.rollback();
    console.error('deleteDoctor error:', e);
    res.status(500).json({ message: 'Failed to delete doctor' });
  } finally {
    conn.release();
  }
};








// GET /api/admin/patients?search=...
exports.getPatients = async (req, res) => {
  const { search = '' } = req.query;
  const like = `%${search.trim()}%`;

  const where = search
    ? `WHERE u.role = 'patient' AND (
         u.name LIKE ? OR u.email LIKE ? OR COALESCE(u.phone,'') LIKE ?
       )`
    : `WHERE u.role = 'patient'`;

  // Uses patient.dob if present, else user.dob
  const sql = `
    SELECT
      u.user_id              AS id,
      u.name,
      u.email,
      COALESCE(u.phone, '')  AS phone,
      COALESCE(p.dob, u.dob) AS dob,
      u.created_at
    FROM user u
    LEFT JOIN patient p ON p.user_id = u.user_id
    ${where}
    ORDER BY u.created_at DESC
  `;

  try {
    const params = search ? [like, like, like] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('getPatients error:', err);
    res.status(500).json({ message: 'Failed to load patients' });
  }
};

// DELETE /api/admin/patients/:id
exports.deletePatient = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid patient id' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Remove related appointments
    await conn.query(`DELETE FROM appointment WHERE patient_id = ?`, [id]);

    // Remove patient profile (if exists)
    try {
      await conn.query(`DELETE FROM patient WHERE user_id = ?`, [id]);
    } catch (_) {
      // Table might be empty, ignore
    }

    // Remove user row
    const [result] = await conn.query(
      `DELETE FROM user WHERE user_id = ? AND role = 'patient'`,
      [id]
    );

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (e) {
    await conn.rollback();
    console.error('deletePatient error:', e);
    res.status(500).json({ message: 'Failed to delete patient' });
  } finally {
    conn.release();
  }
};




// GET /api/admin/appointments?search=...
exports.getAppointments = async (req, res) => {
  const { search = '' } = req.query;
  const like = `%${search.trim()}%`;

  const where = search
    ? `WHERE
         (pu.name LIKE ? OR pu.email LIKE ?
          OR du.name LIKE ? OR du.email LIKE ?
          OR a.status LIKE ?
          OR DATE_FORMAT(a.appointment_date, '%Y-%m-%d') LIKE ?
          OR a.appointment_time LIKE ?)`
    : '';

  const sql = `
    SELECT
      a.appointment_id,
      a.user_id,               -- patient id
      a.doctor_id,             -- doctor id (user_id of doctor)
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.notes,
      pu.name  AS patient_name,
      pu.email AS patient_email,
      du.name  AS doctor_name,
      du.email AS doctor_email
    FROM appointment a
    JOIN user pu ON pu.user_id = a.user_id      -- patient
    JOIN user du ON du.user_id = a.doctor_id    -- doctor (by user_id)
    ${where}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  try {
    const params = search
      ? [like, like, like, like, like, like, like]
      : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
};

// DELETE /api/admin/appointments/:id
exports.deleteAppointment = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid appointment id' });
  }
  try {
    const [result] = await pool.query(
      'DELETE FROM appointment WHERE appointment_id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('deleteAppointment error:', err);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
};
