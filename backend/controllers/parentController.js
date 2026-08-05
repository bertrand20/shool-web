const pool = require('../config/database');

exports.getAllParents = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM parents WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) AS total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const lim = parseInt(limit) || 20;
    const offset = (parseInt(page) - 1) * lim;
    params.push(lim, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      parents: rows,
      pagination: { page: parseInt(page), limit: lim, total, pages: Math.ceil(total / lim) },
    });
  } catch (err) {
    console.error('getAllParents error:', err);
    res.status(500).json({ error: 'Failed to fetch parents' });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parents WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Parent not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getParentById error:', err);
    res.status(500).json({ error: 'Failed to fetch parent' });
  }
};

exports.getParentChildren = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name, c.section AS class_section
       FROM students s LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.parent_id = ?
       ORDER BY s.first_name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('getParentChildren error:', err);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
};

exports.createParent = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, occupation, relationship, address } = req.body;

    const [result] = await pool.query(
      `INSERT INTO parents (first_name, last_name, email, phone, occupation, relationship, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, occupation, relationship || 'Father', address]
    );

    const [newParent] = await pool.query('SELECT * FROM parents WHERE id = ?', [result.insertId]);
    res.status(201).json(newParent[0]);
  } catch (err) {
    console.error('createParent error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A parent with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to register parent' });
  }
};

exports.registerChild = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth, gender,
      class_id, guardian_name, guardian_phone, address
    } = req.body;
    const parent_id = req.params.id;

    const [parentCheck] = await pool.query('SELECT id FROM parents WHERE id = ?', [parent_id]);
    if (parentCheck.length === 0) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const [result] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, phone, date_of_birth, gender, class_id, parent_id, guardian_name, guardian_phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, date_of_birth, gender, class_id || null, parent_id, guardian_name || null, guardian_phone || null, address]
    );

    const [newStudent] = await pool.query(
      `SELECT s.*, c.name AS class_name, c.section AS class_section
       FROM students s LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [result.insertId]
    );
    res.status(201).json(newStudent[0]);
  } catch (err) {
    console.error('registerChild error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to register child' });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, occupation, relationship, address, status } = req.body;

    const [result] = await pool.query(
      `UPDATE parents SET
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       email = COALESCE(?, email),
       phone = COALESCE(?, phone),
       occupation = COALESCE(?, occupation),
       relationship = COALESCE(?, relationship),
       address = COALESCE(?, address),
       status = COALESCE(?, status)
       WHERE id = ?`,
      [first_name, last_name, email, phone, occupation, relationship, address, status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Parent not found' });

    const [updated] = await pool.query('SELECT * FROM parents WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updateParent error:', err);
    res.status(500).json({ error: 'Failed to update parent' });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM parents WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Parent not found' });
    res.json({ message: 'Parent removed successfully' });
  } catch (err) {
    console.error('deleteParent error:', err);
    res.status(500).json({ error: 'Failed to delete parent' });
  }
};
