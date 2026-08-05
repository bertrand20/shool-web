const pool = require('../config/database');

exports.markAttendance = async (req, res) => {
  try {
    const { records, date } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No attendance records provided' });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    for (const record of records) {
      await pool.query(
        `INSERT INTO attendance (student_id, date, status, remarks, recorded_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
        [record.student_id, attendanceDate, record.status, record.remarks || null, record.recorded_by || 'Admin']
      );
    }

    res.json({ message: 'Attendance recorded successfully', date: attendanceDate, count: records.length });
  } catch (err) {
    console.error('markAttendance error:', err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date, class_id } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];

    let query = `
      SELECT a.*, s.first_name, s.last_name, s.email,
             c.name AS class_name, c.section AS class_section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE a.date = ? AND s.status = 'Active'
    `;
    const params = [attendanceDate];

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    query += ` ORDER BY s.first_name, s.last_name`;

    const [rows] = await pool.query(query, params);
    res.json({ date: attendanceDate, records: rows });
  } catch (err) {
    console.error('getAttendanceByDate error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const { student_id, month, year } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    let query = `SELECT * FROM attendance WHERE student_id = ?`;
    const params = [student_id];

    if (month && year) {
      query += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
      params.push(parseInt(month), parseInt(year));
    }

    query += ` ORDER BY date DESC`;

    const [rows] = await pool.query(query, params);

    const summary = {
      total: rows.length,
      present: rows.filter(r => r.status === 'Present').length,
      absent: rows.filter(r => r.status === 'Absent').length,
      late: rows.filter(r => r.status === 'Late').length,
      excused: rows.filter(r => r.status === 'Excused').length,
      rate: rows.length > 0
        ? Math.round((rows.filter(r => r.status === 'Present' || r.status === 'Late').length / rows.length) * 100)
        : 0,
    };

    res.json({ records: rows, summary });
  } catch (err) {
    console.error('getStudentAttendance error:', err);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = `
      SELECT
        a.date,
        COUNT(*) AS total,
        SUM(a.status = 'Present') AS present,
        SUM(a.status = 'Absent') AS absent,
        SUM(a.status = 'Late') AS late,
        SUM(a.status = 'Excused') AS excused
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.status = 'Active'
    `;
    const params = [];

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    query += ` GROUP BY a.date ORDER BY a.date DESC LIMIT 30`;

    const [rows] = await pool.query(query, params);

    const summary = rows.map(row => ({
      ...row,
      rate: row.total > 0 ? Math.round(((parseInt(row.present) + parseInt(row.late)) / parseInt(row.total)) * 100) : 0,
    }));

    res.json(summary);
  } catch (err) {
    console.error('getAttendanceSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};
