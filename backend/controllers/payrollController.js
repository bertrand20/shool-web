const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getSlips = async (req, res) => {
  try {
    const { month, staff_id, payment_status } = req.query;
    let query = [
      'SELECT ss.*, st.first_name, st.last_name, st.email, st.role, st.department,',
      'CONCAT(st.first_name, " ", st.last_name) AS staff_name',
      'FROM salary_slips ss',
      'JOIN staff st ON ss.staff_id = st.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (month) { conditions.push('ss.month = ?'); params.push(month); }
    if (staff_id) { conditions.push('ss.staff_id = ?'); params.push(staff_id); }
    if (payment_status) { conditions.push('ss.payment_status = ?'); params.push(payment_status); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY ss.month DESC, st.last_name';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getSlips error:', err);
    res.status(500).json({ error: 'Failed to fetch salary slips' });
  }
};

exports.generateMonth = async (req, res) => {
  try {
    const { month, allowances = 0, deductions = 0 } = req.body;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month must be in YYYY-MM format' });
    }
    const [staffRows] = await pool.query(
      "SELECT id, salary, status FROM staff WHERE salary IS NOT NULL AND status IN ('Active', 'On Leave')"
    );
    if (staffRows.length === 0) return res.status(400).json({ error: 'No staff with salary configured' });

    let created = 0;
    for (const st of staffRows) {
      const net = parseFloat(st.salary) + parseFloat(allowances) - parseFloat(deductions);
      await pool.query(
        `INSERT INTO salary_slips (staff_id, month, basic_salary, allowances, deductions, net_salary, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending')
         ON DUPLICATE KEY UPDATE
         basic_salary = VALUES(basic_salary), allowances = VALUES(allowances),
         deductions = VALUES(deductions), net_salary = VALUES(net_salary)`,
        [st.id, month, st.salary, allowances, deductions, net]
      );
      created++;
    }
    await logAudit(req, 'generate', 'payroll', null, { month, staff: created });
    res.json({ message: `Generated slips for ${created} staff members`, count: created });
  } catch (err) {
    console.error('generateMonth error:', err);
    res.status(500).json({ error: 'Failed to generate payroll' });
  }
};

exports.updateSlip = async (req, res) => {
  try {
    const { allowances, deductions, payment_status, payment_date, notes } = req.body;
    const [rows] = await pool.query('SELECT * FROM salary_slips WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Salary slip not found' });
    const slip = rows[0];
    const finalAllowances = allowances !== undefined ? allowances : slip.allowances;
    const finalDeductions = deductions !== undefined ? deductions : slip.deductions;
    const net = parseFloat(slip.basic_salary) + parseFloat(finalAllowances) - parseFloat(finalDeductions);

    await pool.query(
      `UPDATE salary_slips SET
       allowances = ?, deductions = ?, net_salary = ?,
       payment_status = COALESCE(?, payment_status),
       payment_date = COALESCE(?, payment_date),
       notes = COALESCE(?, notes)
       WHERE id = ?`,
      [finalAllowances, finalDeductions, net, payment_status, payment_date, notes, req.params.id]
    );
    await logAudit(req, 'update', 'salary_slip', req.params.id, req.body);
    res.json({ message: 'Salary slip updated' });
  } catch (err) {
    console.error('updateSlip error:', err);
    res.status(500).json({ error: 'Failed to update salary slip' });
  }
};

exports.getPayrollSummary = async (req, res) => {
  try {
    const { month } = req.query;
    let query = 'SELECT COUNT(*) AS slips, COALESCE(SUM(net_salary),0) AS total_net, COALESCE(SUM(basic_salary),0) AS total_basic FROM salary_slips';
    const params = [];
    if (month) { query += ' WHERE month = ?'; params.push(month); }
    const [summary] = await pool.query(query, params);
    res.json(summary[0]);
  } catch (err) {
    console.error('getPayrollSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
};
