const pool = require('../config/database');

exports.getLogs = async (req, res) => {
  try {
    const { admin_id, action, entity_type, page = 1, limit = 50 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    if (admin_id) { query += ' AND admin_id = ?'; params.push(admin_id); }
    if (action) { query += ' AND action = ?'; params.push(action); }
    if (entity_type) { query += ' AND entity_type = ?'; params.push(entity_type); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const lim = parseInt(limit) || 50;
    const offset = (parseInt(page) - 1) * lim;
    params.push(lim, offset);
    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM audit_logs'
    );
    res.json({ logs: rows, pagination: { page: parseInt(page), limit: lim, total: countRows[0].total } });
  } catch (err) {
    console.error('getLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    res.json({ message: 'Audit logs cleared' });
  } catch (err) {
    console.error('clearLogs error:', err);
    res.status(500).json({ error: 'Failed to clear audit logs' });
  }
};
