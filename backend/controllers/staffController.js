const pool = require('../config/database');

exports.getAllStaff = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT st.*, c.name AS assigned_class, c.section AS assigned_section
      FROM staff st
      LEFT JOIN classes c ON st.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (st.first_name LIKE ? OR st.last_name LIKE ? OR st.email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (role) {
      query += ' AND st.role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND st.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(
      /SELECT st\.\*, c\.name AS assigned_class, c\.section AS assigned_section/,
      'SELECT COUNT(*) AS total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY st.created_at DESC LIMIT ? OFFSET ?';
    const lim = parseInt(limit) || 20;
    const offset = (parseInt(page) - 1) * lim;
    params.push(lim, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      staff: rows,
      pagination: { page: parseInt(page), limit: lim, total, pages: Math.ceil(total / lim) },
    });
  } catch (err) {
    console.error('getAllStaff error:', err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT st.*, c.name AS assigned_class, c.section AS assigned_section
       FROM staff st LEFT JOIN classes c ON st.class_id = c.id
       WHERE st.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getStaffById error:', err);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, role, department,
      qualification, date_of_birth, gender, hire_date, salary, address, class_id
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO staff (first_name, last_name, email, phone, role, department, qualification, date_of_birth, gender, hire_date, salary, address, class_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, role || 'Teacher', department, qualification, date_of_birth, gender, hire_date || null, salary || null, address, class_id || null]
    );

    const [newStaff] = await pool.query(
      `SELECT st.*, c.name AS assigned_class, c.section AS assigned_section
       FROM staff st LEFT JOIN classes c ON st.class_id = c.id
       WHERE st.id = ?`,
      [result.insertId]
    );
    res.status(201).json(newStaff[0]);
  } catch (err) {
    console.error('createStaff error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A staff member with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to add staff member' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, role, department,
      qualification, date_of_birth, gender, salary, address, class_id, status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE staff SET
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       email = COALESCE(?, email),
       phone = COALESCE(?, phone),
       role = COALESCE(?, role),
       department = COALESCE(?, department),
       qualification = COALESCE(?, qualification),
       date_of_birth = COALESCE(?, date_of_birth),
       gender = COALESCE(?, gender),
       salary = COALESCE(?, salary),
       address = COALESCE(?, address),
       class_id = COALESCE(?, class_id),
       status = COALESCE(?, status)
       WHERE id = ?`,
      [first_name, last_name, email, phone, role, department, qualification, date_of_birth, gender, salary, address, class_id, status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff member not found' });

    const [updated] = await pool.query(
      `SELECT st.*, c.name AS assigned_class, c.section AS assigned_section
       FROM staff st LEFT JOIN classes c ON st.class_id = c.id
       WHERE st.id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error('updateStaff error:', err);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Staff member removed successfully' });
  } catch (err) {
    console.error('deleteStaff error:', err);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
};

exports.getStaffStats = async (_req, res) => {
  try {
    const [total] = await pool.query("SELECT COUNT(*) AS count FROM staff WHERE status = 'Active'");
    const [byRole] = await pool.query(
      'SELECT role, COUNT(*) AS count FROM staff WHERE status = \'Active\' GROUP BY role ORDER BY count DESC'
    );
    res.json({
      total_active: total[0].count,
      by_role: byRole,
    });
  } catch (err) {
    console.error('getStaffStats error:', err);
    res.status(500).json({ error: 'Failed to fetch staff stats' });
  }
};
