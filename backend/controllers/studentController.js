const pool = require('../config/database');

exports.getAllStudents = async (req, res) => {
  try {
    const { search, status, class_id, page = 1, limit = 20 } = req.query;
    let query = `
      SELECT s.*, c.name AS class_name, c.section AS class_section
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    const countQuery = query.replace(
      /SELECT s\.\*, c\.name AS class_name, c\.section AS class_section/,
      'SELECT COUNT(*) AS total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    const lim = parseInt(limit) || 20;
    const offset = (parseInt(page) - 1) * lim;
    params.push(lim, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      students: rows,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total,
        pages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    console.error('getAllStudents error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS class_name, c.section AS class_section
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('getStudentById error:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth,
      gender, class_id, guardian_name, guardian_phone, address
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO students
       (first_name, last_name, email, phone, date_of_birth, gender, class_id, guardian_name, guardian_phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, date_of_birth, gender, class_id || null, guardian_name, guardian_phone, address]
    );

    const [newStudent] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    res.status(201).json(newStudent[0]);
  } catch (err) {
    console.error('createStudent error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, date_of_birth,
      gender, class_id, guardian_name, guardian_phone, address, status
    } = req.body;

    const [result] = await pool.query(
      `UPDATE students SET
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       email = COALESCE(?, email),
       phone = COALESCE(?, phone),
       date_of_birth = COALESCE(?, date_of_birth),
       gender = COALESCE(?, gender),
       class_id = COALESCE(?, class_id),
       guardian_name = COALESCE(?, guardian_name),
       guardian_phone = COALESCE(?, guardian_phone),
       address = COALESCE(?, address),
       status = COALESCE(?, status)
       WHERE id = ?`,
      [first_name, last_name, email, phone, date_of_birth, gender, class_id, guardian_name, guardian_phone, address, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const [updated] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updateStudent error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

exports.getClasses = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM classes ORDER BY name, section');
    res.json(rows);
  } catch (err) {
    console.error('getClasses error:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};
