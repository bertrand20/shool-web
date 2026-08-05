const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getTransferCertificate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [[student]] = await pool.query(
      `SELECT st.*, c.name AS class_name, c.section,
       p.first_name AS parent_first, p.last_name AS parent_last
       FROM students st
       LEFT JOIN classes c ON st.class_id = c.id
       LEFT JOIN parents p ON st.parent_id = p.id
       WHERE st.id = ?`,
      [studentId]
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [attendance] = await pool.query(
      `SELECT COUNT(*) AS days_present,
       COUNT(CASE WHEN status IN ('Absent','Late') THEN 1 END) AS days_absent
       FROM attendance WHERE student_id = ?`,
      [studentId]
    );
    const [avg] = await pool.query(
      'SELECT ROUND(AVG(pct),2) AS average FROM (SELECT student_id, (SUM(marks)/SUM(max_marks))*100 AS pct FROM student_marks WHERE student_id = ? GROUP BY exam_id) t',
      [studentId]
    );
    const [behavior] = await pool.query(
      "SELECT COUNT(*) AS incidents FROM behavior_logs WHERE student_id = ? AND entry_type IN ('Warning','Incident','Suspension')",
      [studentId]
    );

    res.json({
      student,
      certificate_no: `TC-${new Date().getFullYear()}-${String(studentId).padStart(4, '0')}`,
      issued_on: new Date().toISOString().slice(0, 10),
      days_present: attendance[0].days_present || 0,
      days_absent: attendance[0].days_absent || 0,
      average: avg[0] ? avg[0].average : null,
      incidents: behavior[0].incidents || 0,
    });
  } catch (err) {
    console.error('getTransferCertificate error:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

exports.getCertificateReportCard = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    const [[student]] = await pool.query(
      `SELECT st.*, c.name AS class_name, c.section
       FROM students st LEFT JOIN classes c ON st.class_id = c.id WHERE st.id = ?`,
      [studentId]
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const [[exam]] = await pool.query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    const [marks] = await pool.query(
      'SELECT sm.*, s.name AS subject_name FROM student_marks sm JOIN subjects s ON sm.subject_id = s.id WHERE sm.student_id = ? AND sm.exam_id = ? ORDER BY s.name',
      [studentId, examId]
    );
    const totalMarks = marks.reduce((sum, m) => sum + parseFloat(m.marks), 0);
    const totalMax = marks.reduce((sum, m) => sum + parseFloat(m.max_marks), 0);
    const average = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;
    res.json({ student, exam, marks, summary: { totalMarks, totalMax, average } });
  } catch (err) {
    console.error('getCertificateReportCard error:', err);
    res.status(500).json({ error: 'Failed to generate report card certificate' });
  }
};
