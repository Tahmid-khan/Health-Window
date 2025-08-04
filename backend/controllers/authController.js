
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Register General User (e.g., Patient)
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, role, dob } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO user (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role]
    );

    const userId = result.insertId;

    // If registering as a patient, insert into patient table
  if (role === 'patient') {
            await db.query(
                "INSERT INTO patient (user_id, dob) VALUES (?, ?)",
                [userId, dob]
            );
        }


    res.status(201).json({ message: "User registered successfully.", userId });
  } catch (err) {
    console.error("User registration error:", err);
    res.status(500).json({ message: "Registration failed." });
  }
};

// Register Doctor
exports.registerDoctor = async (req, res) => {
  const {
    firstName, lastName, email, phone, dob,
    password, license, qualification, specialty, experience, bio
  } = req.body;

  const fullName = `${firstName} ${lastName}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [existing] = await conn.query("SELECT * FROM user WHERE email = ?", [email]);
    if (existing.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ message: 'User already exists' });
    }

    const [userResult] = await conn.query(
      "INSERT INTO user (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, phone, 'doctor']
    );

    const userId = userResult.insertId;

    await conn.query(
      `INSERT INTO doctor (user_id, medical_license_number, qualification, experience_years, specialty, bio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, license, qualification, experience, specialty, bio]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({ message: "Doctor registered successfully.", userId });
  } catch (err) {
    console.error("Doctor registration error:", err);
    res.status(500).json({ message: "Registration failed." });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Send back all required fields
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role // 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


// Get Full Profile by User ID (doctor or patient)
// Get User by ID (supports both patient and doctor)
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT 
         u.user_id, u.name, u.email, u.phone, u.role,
         p.dob,
         d.medical_license_number, d.qualification, d.experience_years, d.specialty, d.bio
       FROM user u
       LEFT JOIN patient p ON u.user_id = p.user_id
       LEFT JOIN doctor d ON u.user_id = d.user_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

// taking doctors to the specialists

exports.getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.query("SELECT * FROM user WHERE role = 'doctor'");
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};
