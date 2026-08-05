const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getLeaveRequests = async (req, res) => {
  try {
    const { status, staff_id } = req.query;
    let query = [
      'SELECT lr.*, CONCAT(st.first_name, " ", st.last_name) AS staff_name, st.email AS staff_email, st.role',
      'FROM leave_requests lr',
      'JOIN staff st ON lr.staff_id = st.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (status) { conditions.push('lr.status = ?'); params.push(status); }
    if (staff_id) { conditions.push('lr.staff_id = ?'); params.push(staff_id); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY lr.start_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getLeaveRequests error:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { staff_id, leave_type, start_date, end_date, reason } = req.body;
    if (!staff_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'staff_id, start_date, and end_date are required' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'end_date cannot be before start_date' });
    }
    const [result] = await pool.query(
      'INSERT INTO leave_requests (staff_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      [staff_id, leave_type || 'Casual', start_date, end_date, reason || null]
    );
    await logAudit(req, 'create', 'leave_request', result.insertId, req.body);
    res.status(201).json({ message: 'Leave request created', id: result.insertId });
  } catch (err) {
    console.error('createLeaveRequest error:', err);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const admin = req.admin || {};
    const [result] = await pool.query(
      `UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, admin.full_name || admin.username || 'Admin', req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Leave request not found' });
    await logAudit(req, status.toLowerCase() + '_leave', 'leave_request', req.params.id, req.body);
    res.json({ message: 'Leave request ' + status.toLowerCase() });
  } catch (err) {
    console.error('updateLeaveStatus error:', err);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
};

exports.deleteLeaveRequest = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM leave_requests WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Leave request not found' });
    await logAudit(req, 'delete', 'leave_request', req.params.id, null);
    res.json({ message: 'Leave request removed' });
  } catch (err) {
    console.error('deleteLeaveRequest error:', err);
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
};
