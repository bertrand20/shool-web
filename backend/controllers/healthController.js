const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getHealthRecords = async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = [
      'SELECT h.*, CONCAT(s.first_name, " ", s.last_name) AS student_name,',
      'CONCAT(n.first_name, " ", n.last_name) AS nurse_name',
      'FROM health_records h',
      'JOIN students s ON h.student_id = s.id',
      'LEFT JOIN staff n ON h.nurse_staff_id = n.id',
    ].join(' ');
    const params = [];
    if (student_id) { query += ' WHERE h.student_id = ?'; params.push(student_id); }
    query += ' ORDER BY h.visit_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getHealthRecords error:', err);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

exports.createHealthRecord = async (req, res) => {
  try {
    const { student_id, visit_date, visit_type, symptoms, diagnosis, treatment, nurse_staff_id, notes } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });
    const [result] = await pool.query(
      `INSERT INTO health_records (student_id, visit_date, visit_type, symptoms, diagnosis, treatment, nurse_staff_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, visit_date || null, visit_type || 'Checkup', symptoms || null, diagnosis || null, treatment || null, nurse_staff_id || null, notes || null]
    );
    await logAudit(req, 'create', 'health_record', result.insertId, req.body);
    res.status(201).json({ message: 'Health record created', id: result.insertId });
  } catch (err) {
    console.error('createHealthRecord error:', err);
    res.status(500).json({ error: 'Failed to create health record' });
  }
};

exports.deleteHealthRecord = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM health_records WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Health record not found' });
    await logAudit(req, 'delete', 'health_record', req.params.id, null);
    res.json({ message: 'Health record removed' });
  } catch (err) {
    console.error('deleteHealthRecord error:', err);
    res.status(500).json({ error: 'Failed to delete health record' });
  }
};

exports.getVaccinations = async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = [
      'SELECT v.*, CONCAT(s.first_name, " ", s.last_name) AS student_name',
      'FROM vaccinations v',
      'JOIN students s ON v.student_id = s.id',
    ].join(' ');
    const params = [];
    if (student_id) { query += ' WHERE v.student_id = ?'; params.push(student_id); }
    query += ' ORDER BY v.date_given DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getVaccinations error:', err);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
};

exports.createVaccination = async (req, res) => {
  try {
    const { student_id, vaccine_name, dose_number, date_given, notes } = req.body;
    if (!student_id || !vaccine_name) return res.status(400).json({ error: 'student_id and vaccine_name are required' });
    const [result] = await pool.query(
      'INSERT INTO vaccinations (student_id, vaccine_name, dose_number, date_given, notes) VALUES (?, ?, ?, ?, ?)',
      [student_id, vaccine_name, dose_number || null, date_given || null, notes || null]
    );
    await logAudit(req, 'create', 'vaccination', result.insertId, req.body);
    res.status(201).json({ message: 'Vaccination recorded', id: result.insertId });
  } catch (err) {
    console.error('createVaccination error:', err);
    res.status(500).json({ error: 'Failed to record vaccination' });
  }
};

exports.deleteVaccination = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM vaccinations WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vaccination not found' });
    await logAudit(req, 'delete', 'vaccination', req.params.id, null);
    res.json({ message: 'Vaccination removed' });
  } catch (err) {
    console.error('deleteVaccination error:', err);
    res.status(500).json({ error: 'Failed to delete vaccination' });
  }
};
