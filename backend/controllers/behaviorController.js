const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getBehaviorLogs = async (req, res) => {
  try {
    const { student_id, entry_type } = req.query;
    let query = [
      'SELECT b.*, CONCAT(s.first_name, " ", s.last_name) AS student_name,',
      'c.name AS class_name, c.section',
      'FROM behavior_logs b',
      'JOIN students s ON b.student_id = s.id',
      'LEFT JOIN classes c ON s.class_id = c.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (student_id) { conditions.push('b.student_id = ?'); params.push(student_id); }
    if (entry_type) { conditions.push('b.entry_type = ?'); params.push(entry_type); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY b.entry_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getBehaviorLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch behavior logs' });
  }
};

exports.createBehaviorLog = async (req, res) => {
  try {
    const { student_id, entry_type, title, description, entry_date } = req.body;
    if (!student_id || !title) return res.status(400).json({ error: 'student_id and title are required' });
    const admin = req.admin || {};
    const [result] = await pool.query(
      `INSERT INTO behavior_logs (student_id, entry_type, title, description, entry_date, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, entry_type || 'Incident', title, description || null, entry_date || null, admin.full_name || admin.username || 'Admin']
    );
    await logAudit(req, 'create', 'behavior_log', result.insertId, req.body);
    res.status(201).json({ message: 'Behavior entry logged', id: result.insertId });
  } catch (err) {
    console.error('createBehaviorLog error:', err);
    res.status(500).json({ error: 'Failed to create behavior log' });
  }
};

exports.deleteBehaviorLog = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM behavior_logs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Behavior log not found' });
    await logAudit(req, 'delete', 'behavior_log', req.params.id, null);
    res.json({ message: 'Behavior log removed' });
  } catch (err) {
    console.error('deleteBehaviorLog error:', err);
    res.status(500).json({ error: 'Failed to delete behavior log' });
  }
};
