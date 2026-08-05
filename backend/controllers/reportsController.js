const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCSV(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(',');
  const body = rows.map((r) =>
    columns.map((c) => csvEscape(r[c.key])).join(',')
  );
  return [header, ...body].join('\r\n');
}

function sendCSV(res, csv, filename) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

exports.exportAttendance = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;
    let query = [
      'SELECT s.id, s.first_name, s.last_name, c.name AS class_name, c.section,',
      'a.date, a.status, a.remarks',
      'FROM attendance a',
      'JOIN students s ON a.student_id = s.id',
      'LEFT JOIN classes c ON s.class_id = c.id',
    ].join(' ');
    const conditions = ['1=1'];
    const params = [];
    if (class_id) { conditions.push('s.class_id = ?'); params.push(class_id); }
    if (start_date) { conditions.push('a.date >= ?'); params.push(start_date); }
    if (end_date) { conditions.push('a.date <= ?'); params.push(end_date); }
    query += ' WHERE ' + conditions.join(' AND ') + ' ORDER BY a.date, s.last_name';
    const [rows] = await pool.query(query, params);
    const csv = toCSV(rows, [
      { key: 'id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'class_name', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'remarks', label: 'Remarks' },
    ]);
    await logAudit(req, 'export', 'attendance_report', null, { class_id, start_date, end_date, rows: rows.length });
    sendCSV(res, csv, `attendance_${start_date || 'all'}_${end_date || 'all'}.csv`);
  } catch (err) {
    console.error('exportAttendance error:', err);
    res.status(500).json({ error: 'Failed to export attendance' });
  }
};

exports.exportOutstandingFees = async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = [
      'SELECT s.id AS student_id, s.first_name, s.last_name, c.name AS class_name, c.section,',
      'COALESCE(SUM(f.amount), 0) AS total_fees,',
      'COALESCE(SUM(fp.amount_paid), 0) AS amount_paid,',
      'COALESCE(SUM(f.amount), 0) - COALESCE(SUM(fp.amount_paid), 0) AS balance',
      'FROM students s',
      'JOIN classes c ON s.class_id = c.id',
      'JOIN fees f ON f.class_id = s.class_id',
      'LEFT JOIN fee_payments fp ON fp.student_id = s.id AND fp.fee_id = f.id',
    ].join(' ');
    const conditions = ['s.status = ?'];
    const params = ['Active'];
    if (class_id) { conditions.push('s.class_id = ?'); params.push(class_id); }
    query += ' WHERE ' + conditions.join(' AND ') +
      ' GROUP BY s.id, s.first_name, s.last_name, c.name, c.section' +
      ' HAVING balance > 0 ORDER BY s.last_name';
    const [rows] = await pool.query(query, params);
    const csv = toCSV(rows, [
      { key: 'student_id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'class_name', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'total_fees', label: 'Total Fees' },
      { key: 'amount_paid', label: 'Amount Paid' },
      { key: 'balance', label: 'Outstanding Balance' },
    ]);
    await logAudit(req, 'export', 'outstanding_fees', null, { class_id, rows: rows.length });
    sendCSV(res, csv, 'outstanding_fees.csv');
  } catch (err) {
    console.error('exportOutstandingFees error:', err);
    res.status(500).json({ error: 'Failed to export outstanding fees' });
  }
};

exports.exportMarks = async (req, res) => {
  try {
    const { exam_id, class_id } = req.query;
    if (!exam_id) return res.status(400).json({ error: 'exam_id is required' });
    let query = [
      'SELECT st.id AS student_id, st.first_name, st.last_name, c.name AS class_name, c.section,',
      's.name AS subject_name, sm.marks, sm.max_marks, e.name AS exam_name',
      'FROM student_marks sm',
      'JOIN students st ON sm.student_id = st.id',
      'JOIN subjects s ON sm.subject_id = s.id',
      'JOIN exams e ON sm.exam_id = e.id',
      'LEFT JOIN classes c ON st.class_id = c.id',
    ].join(' ');
    const conditions = ['sm.exam_id = ?'];
    const params = [exam_id];
    if (class_id) { conditions.push('st.class_id = ?'); params.push(class_id); }
    query += ' WHERE ' + conditions.join(' AND ') + ' ORDER BY st.last_name, s.name';
    const [rows] = await pool.query(query, params);
    const csv = toCSV(rows, [
      { key: 'student_id', label: 'Student ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'class_name', label: 'Class' },
      { key: 'section', label: 'Section' },
      { key: 'subject_name', label: 'Subject' },
      { key: 'marks', label: 'Marks' },
      { key: 'max_marks', label: 'Max Marks' },
      { key: 'exam_name', label: 'Exam' },
    ]);
    await logAudit(req, 'export', 'marks_report', null, { exam_id, class_id, rows: rows.length });
    sendCSV(res, csv, `marks_exam_${exam_id}.csv`);
  } catch (err) {
    console.error('exportMarks error:', err);
    res.status(500).json({ error: 'Failed to export marks' });
  }
};

exports.exportPayroll = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month (YYYY-MM) is required' });
    const [rows] = await pool.query(
      `SELECT st.first_name, st.last_name, st.email, st.role, st.department,
       ss.month, ss.basic_salary, ss.allowances, ss.deductions, ss.net_salary, ss.payment_status
       FROM salary_slips ss
       JOIN staff st ON ss.staff_id = st.id
       WHERE ss.month = ? ORDER BY st.last_name`,
      [month]
    );
    const csv = toCSV(rows, [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'department', label: 'Department' },
      { key: 'month', label: 'Month' },
      { key: 'basic_salary', label: 'Basic Salary' },
      { key: 'allowances', label: 'Allowances' },
      { key: 'deductions', label: 'Deductions' },
      { key: 'net_salary', label: 'Net Salary' },
      { key: 'payment_status', label: 'Payment Status' },
    ]);
    await logAudit(req, 'export', 'payroll_report', null, { month, rows: rows.length });
    sendCSV(res, csv, `payroll_${month}.csv`);
  } catch (err) {
    console.error('exportPayroll error:', err);
    res.status(500).json({ error: 'Failed to export payroll' });
  }
};
