const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test connection (optional but helpful)
(async () => {
  try {
    const conn = await db.getConnection();
    console.log('✅ Connected to MySQL database');
    conn.release(); // release the connection back to the pool
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
  }
})();

module.exports = db;
