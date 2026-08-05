const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getTimetable = async (req, res) => {
  try {
    const { class_id, staff_id, day_of_week } = req.query;
    let query = [
      'SELECT te.*, c.name AS class_name, c.section,',
      's.name AS subject_name, s.code AS subject_code,',
      'CONCAT(st.first_name, " ", st.last_name) AS teacher_name',
      'FROM timetable_entries te',
      'LEFT JOIN classes c ON te.class_id = c.id',
      'LEFT JOIN subjects s ON te.subject_id = s.id',
      'LEFT JOIN staff st ON te.staff_id = st.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (class_id) { conditions.push('te.class_id = ?'); params.push(class_id); }
    if (staff_id) { conditions.push('te.staff_id = ?'); params.push(staff_id); }
    if (day_of_week) { conditions.push('te.day_of_week = ?'); params.push(day_of_week); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY FIELD(te.day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), te.period_number';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getTimetable error:', err);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

exports.createTimetableEntry = async (req, res) => {
  try {
    const { class_id, staff_id, subject_id, day_of_week, period_number, start_time, end_time, location } = req.body;
    if (!class_id || !day_of_week || !period_number) {
      return res.status(400).json({ error: 'class_id, day_of_week, and period_number are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO timetable_entries (class_id, staff_id, subject_id, day_of_week, period_number, start_time, end_time, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [class_id, staff_id || null, subject_id || null, day_of_week, period_number, start_time || null, end_time || null, location || null]
    );
    await logAudit(req, 'create', 'timetable', result.insertId, req.body);
    res.status(201).json({ message: 'Timetable entry created', id: result.insertId });
  } catch (err) {
    console.error('createTimetableEntry error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Period already exists for this class on that day' });
    }
    res.status(500).json({ error: 'Failed to create timetable entry' });
  }
};

exports.updateTimetableEntry = async (req, res) => {
  try {
    const { staff_id, subject_id, day_of_week, period_number, start_time, end_time, location } = req.body;
    const [result] = await pool.query(
      `UPDATE timetable_entries SET
       staff_id = COALESCE(?, staff_id),
       subject_id = COALESCE(?, subject_id),
       day_of_week = COALESCE(?, day_of_week),
       period_number = COALESCE(?, period_number),
       start_time = COALESCE(?, start_time),
       end_time = COALESCE(?, end_time),
       location = COALESCE(?, location)
       WHERE id = ?`,
      [staff_id, subject_id, day_of_week, period_number, start_time, end_time, location, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Timetable entry not found' });
    await logAudit(req, 'update', 'timetable', req.params.id, req.body);
    res.json({ message: 'Timetable entry updated' });
  } catch (err) {
    console.error('updateTimetableEntry error:', err);
    res.status(500).json({ error: 'Failed to update timetable entry' });
  }
};

exports.deleteTimetableEntry = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM timetable_entries WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Timetable entry not found' });
    await logAudit(req, 'delete', 'timetable', req.params.id, null);
    res.json({ message: 'Timetable entry removed' });
  } catch (err) {
    console.error('deleteTimetableEntry error:', err);
    res.status(500).json({ error: 'Failed to delete timetable entry' });
  }
};

exports.getTimetableSummary = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total_entries, COUNT(DISTINCT class_id) AS classes_scheduled,
       COUNT(DISTINCT staff_id) AS teachers_allocated
       FROM timetable_entries`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('getTimetableSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch timetable summary' });
  }
};
