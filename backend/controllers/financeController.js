const pool = require('../config/database');

exports.getFees = async (req, res) => {
  try {
    const { class_id, academic_year } = req.query;

    let query = `
      SELECT f.*, c.name AS class_name, c.section AS class_section
      FROM fees f
      LEFT JOIN classes c ON f.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ` AND f.class_id = ?`;
      params.push(class_id);
    }

    if (academic_year) {
      query += ` AND f.academic_year = ?`;
      params.push(academic_year);
    }

    query += ` ORDER BY c.name, c.section, f.fee_type`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getFees error:', err);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

exports.createFee = async (req, res) => {
  try {
    const { class_id, fee_type, amount, due_date, academic_year, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO fees (class_id, fee_type, amount, due_date, academic_year, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [class_id, fee_type, amount, due_date, academic_year, description]
    );

    const [newFee] = await pool.query('SELECT * FROM fees WHERE id = ?', [result.insertId]);
    res.status(201).json(newFee[0]);
  } catch (err) {
    console.error('createFee error:', err);
    res.status(500).json({ error: 'Failed to create fee' });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { student_id, fee_id, amount_paid, payment_method, receipt_number, notes, recorded_by } = req.body;

    const [result] = await pool.query(
      `INSERT INTO fee_payments (student_id, fee_id, amount_paid, payment_method, receipt_number, notes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, fee_id, amount_paid, payment_method || 'Cash', receipt_number, notes, recorded_by || 'Admin']
    );

    const [newPayment] = await pool.query('SELECT * FROM fee_payments WHERE id = ?', [result.insertId]);
    res.status(201).json(newPayment[0]);
  } catch (err) {
    console.error('recordPayment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

exports.getStudentPayments = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const [rows] = await pool.query(
      `SELECT fp.*, f.fee_type, f.amount AS fee_amount, f.academic_year
       FROM fee_payments fp
       JOIN fees f ON fp.fee_id = f.id
       WHERE fp.student_id = ?
       ORDER BY fp.payment_date DESC`,
      [student_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('getStudentPayments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.getOutstandingBalances = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        c.name AS class_name,
        c.section AS class_section,
        COALESCE(SUM(f.amount), 0) AS total_fees,
        COALESCE(SUM(fp.total_paid), 0) AS total_paid,
        COALESCE(SUM(f.amount), 0) - COALESCE(SUM(fp.total_paid), 0) AS balance
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN fees f ON f.class_id = s.class_id
      LEFT JOIN (
        SELECT student_id, fee_id, SUM(amount_paid) AS total_paid
        FROM fee_payments
        GROUP BY student_id, fee_id
      ) fp ON fp.student_id = s.id AND fp.fee_id = f.id
      WHERE s.status = 'Active'
      GROUP BY s.id, s.first_name, s.last_name, s.email, c.name, c.section
      HAVING balance > 0
      ORDER BY balance DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('getOutstandingBalances error:', err);
    res.status(500).json({ error: 'Failed to fetch outstanding balances' });
  }
};

exports.getRevenueSummary = async (_req, res) => {
  try {
    const [totalCollected] = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) AS total FROM fee_payments'
    );

    const [totalExpected] = await pool.query(`
      SELECT COALESCE(SUM(f.amount), 0) AS total
      FROM fees f
      JOIN students s ON f.class_id = s.class_id
      WHERE s.status = 'Active'
    `);

    const [recentPayments] = await pool.query(`
      SELECT fp.*, s.first_name, s.last_name, f.fee_type
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.id
      JOIN fees f ON fp.fee_id = f.id
      ORDER BY fp.payment_date DESC
      LIMIT 5
    `);

    const [monthlyRevenue] = await pool.query(`
      SELECT
        DATE_FORMAT(payment_date, '%Y-%m') AS month,
        SUM(amount_paid) AS total
      FROM fee_payments
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `);

    res.json({
      total_collected: totalCollected[0].total,
      total_expected: totalExpected[0].total,
      outstanding: totalExpected[0].total - totalCollected[0].total,
      recent_payments: recentPayments,
      monthly_revenue: monthlyRevenue.reverse(),
    });
  } catch (err) {
    console.error('getRevenueSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
};
