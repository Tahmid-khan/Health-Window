const db = require('../config/db');

const generateTimeSlots = async (req, res) => {
  const { doctor_id, available_date, start_time, end_time } = req.body;

  if (!doctor_id || !available_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const start = new Date(`${available_date}T${start_time}`);
    const end = new Date(`${available_date}T${end_time}`);
    const slots = [];

    while (start < end) {
      const next = new Date(start.getTime() + 30 * 60000); // 30 mins
      if (next > end) break;

      slots.push([doctor_id, available_date, start.toTimeString().slice(0, 8), next.toTimeString().slice(0, 8)]);
      start.setTime(next.getTime());
    }

    const sql = `
      INSERT INTO timeslot (doctor_id, available_date, start_time, end_time)
      VALUES ?
    `;

    await db.promise().query(sql, [slots]);

    res.status(201).json({ message: 'Time slots generated', count: slots.length });
  } catch (err) {
    console.error('Time slot generation failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// export the function
module.exports = {
  generateTimeSlots
};
