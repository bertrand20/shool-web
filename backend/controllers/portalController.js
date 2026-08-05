const pool = require('../config/database');

exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM announcements WHERE is_published = 1 ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('getAnnouncements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getGallery error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

exports.getSchoolInfo = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM school_info');
    const info = {};
    rows.forEach((row) => {
      info[row.info_key] = row.info_value;
    });
    res.json(info);
  } catch (err) {
    console.error('getSchoolInfo error:', err);
    res.status(500).json({ error: 'Failed to fetch school info' });
  }
};

exports.getStats = async (_req, res) => {
  try {
    const [[{ studentCount }]] = await pool.query("SELECT COUNT(*) AS studentCount FROM students WHERE status = 'Active'");
    const [[{ staffCount }]] = await pool.query("SELECT COUNT(*) AS staffCount FROM staff WHERE status = 'Active'");
    const [[{ parentCount }]] = await pool.query("SELECT COUNT(*) AS parentCount FROM parents WHERE status = 'Active'");
    const [[{ classCount }]] = await pool.query('SELECT COUNT(*) AS classCount FROM classes');

    res.json({ studentCount, staffCount, parentCount, classCount });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    const q = `%${query.trim()}%`;
    const [rows] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.status,
              c.name AS class_name, c.section,
              p.first_name AS parent_first, p.last_name AS parent_last, p.email AS parent_email, p.phone AS parent_phone
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ? OR s.id = ?)
         AND s.status = 'Active'
       LIMIT 10`,
      [q, q, q, parseInt(query) || 0]
    );
    res.json(rows);
  } catch (err) {
    console.error('searchStudent error:', err);
    res.status(500).json({ error: 'Failed to search students' });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [[student]] = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, c.name AS class_name, c.section
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [studentId]
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [fees] = await pool.query(
      `SELECT f.id, f.fee_type, f.amount, f.due_date, f.academic_year, f.description,
              COALESCE(SUM(fp.amount_paid), 0) AS total_paid
       FROM fees f
       LEFT JOIN fee_payments fp ON f.id = fp.fee_id AND fp.student_id = ?
       WHERE f.class_id = ?
       GROUP BY f.id
       ORDER BY f.due_date`,
      [studentId, student.class_id || 0]
    );

    const [payments] = await pool.query(
      `SELECT fp.*, f.fee_type, f.amount AS fee_amount
       FROM fee_payments fp
       JOIN fees f ON fp.fee_id = f.id
       WHERE fp.student_id = ?
       ORDER BY fp.payment_date DESC`,
      [studentId]
    );

    res.json({ student, fees, payments });
  } catch (err) {
    console.error('getStudentFees error:', err);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
};

exports.submitPayment = async (req, res) => {
  try {
    const { student_id, fee_id, amount_paid, payment_method, notes } = req.body;
    if (!student_id || !fee_id || !amount_paid) {
      return res.status(400).json({ error: 'student_id, fee_id, and amount_paid are required' });
    }

    const [[student]] = await pool.query('SELECT id, first_name, last_name FROM students WHERE id = ? AND status = ?',
      [student_id, 'Active']);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [[fee]] = await pool.query('SELECT * FROM fees WHERE id = ?', [fee_id]);
    if (!fee) return res.status(404).json({ error: 'Fee not found' });

    const [[existing]] = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM fee_payments WHERE student_id = ? AND fee_id = ?',
      [student_id, fee_id]
    );
    const balance = parseFloat(fee.amount) - parseFloat(existing.total_paid);
    if (parseFloat(amount_paid) > balance) {
      return res.status(400).json({ error: `Amount exceeds outstanding balance of $${balance.toFixed(2)}` });
    }

    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [result] = await pool.query(
      `INSERT INTO fee_payments (student_id, fee_id, amount_paid, payment_date, payment_method, receipt_number, notes, recorded_by)
       VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?, 'Parent Online')`,
      [student_id, fee_id, amount_paid, payment_method || 'Online', receiptNumber, notes || null]
    );

    res.status(201).json({
      message: 'Payment submitted successfully',
      payment_id: result.insertId,
      receipt_number: receiptNumber,
    });
  } catch (err) {
    console.error('submitPayment error:', err);
    res.status(500).json({ error: 'Failed to submit payment' });
  }
};

exports.adminGetAllPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fp.*, f.fee_type, f.amount AS fee_amount, f.academic_year,
              s.first_name AS student_first, s.last_name AS student_last,
              c.name AS class_name, c.section
       FROM fee_payments fp
       JOIN fees f ON fp.fee_id = f.id
       JOIN students s ON fp.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       ORDER BY fp.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('adminGetAllPayments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.adminUpdatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid, payment_method, notes } = req.body;

    const [[existing]] = await pool.query('SELECT * FROM fee_payments WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Payment not found' });

    const [[fee]] = await pool.query('SELECT amount FROM fees WHERE id = ?', [existing.fee_id]);
    const [[otherPaid]] = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) AS total FROM fee_payments WHERE student_id = ? AND fee_id = ? AND id != ?',
      [existing.student_id, existing.fee_id, id]
    );
    const maxAllowed = parseFloat(fee.amount) - parseFloat(otherPaid.total);
    if (amount_paid && parseFloat(amount_paid) > maxAllowed) {
      return res.status(400).json({ error: `Amount exceeds max allowed of $${maxAllowed.toFixed(2)}` });
    }

    await pool.query(
      `UPDATE fee_payments SET amount_paid = COALESCE(?, amount_paid),
       payment_method = COALESCE(?, payment_method), notes = COALESCE(?, notes) WHERE id = ?`,
      [amount_paid, payment_method, notes, id]
    );

    res.json({ message: 'Payment updated' });
  } catch (err) {
    console.error('adminUpdatePayment error:', err);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

exports.adminDeletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query('SELECT id FROM fee_payments WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Payment not found' });

    await pool.query('DELETE FROM fee_payments WHERE id = ?', [id]);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    console.error('adminDeletePayment error:', err);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};
