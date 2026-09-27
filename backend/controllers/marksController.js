const pool = require('../config/database');

exports.getSubjects = async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = 'SELECT s.*, c.name AS class_name, c.section FROM subjects s LEFT JOIN classes c ON s.class_id = c.id';
    const params = [];
    if (class_id) { query += ' WHERE s.class_id = ?'; params.push(class_id); }
    query += ' ORDER BY s.name';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getSubjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, class_id } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    const [result] = await pool.query('INSERT INTO subjects (name, code, class_id) VALUES (?, ?, ?)', [name, code, class_id || null]);
    res.status(201).json({ message: 'Subject created', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Subject code already exists' });
    console.error('createSubject error:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('deleteSubject error:', err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

exports.getExams = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exams ORDER BY academic_year DESC, term, type');
    res.json(rows);
  } catch (err) {
    console.error('getExams error:', err);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { name, type, academic_year, term } = req.body;
    if (!name || !type || !academic_year) return res.status(400).json({ error: 'Name, type, and academic_year are required' });
    const [result] = await pool.query('INSERT INTO exams (name, type, academic_year, term) VALUES (?, ?, ?, ?)', [name, type, academic_year, term || null]);
    res.status(201).json({ message: 'Exam created', id: result.insertId });
  } catch (err) {
    console.error('createExam error:', err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await pool.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    console.error('deleteExam error:', err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

exports.getMarks = async (req, res) => {
  try {
    const { exam_id, class_id, student_id } = req.query;
    const query = [
      'SELECT sm.*, s.name AS subject_name, s.code AS subject_code,',
      'st.first_name AS student_first, st.last_name AS student_last,',
      'c.name AS class_name, c.section, e.name AS exam_name, e.type AS exam_type',
      'FROM student_marks sm',
      'JOIN subjects s ON sm.subject_id = s.id',
      'JOIN students st ON sm.student_id = st.id',
      'LEFT JOIN classes c ON st.class_id = c.id',
      'JOIN exams e ON sm.exam_id = e.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (exam_id) { conditions.push('sm.exam_id = ?'); params.push(exam_id); }
    if (class_id) { conditions.push('st.class_id = ?'); params.push(class_id); }
    if (student_id) { conditions.push('sm.student_id = ?'); params.push(student_id); }
    let fullQuery = query;
    if (conditions.length) fullQuery += ' WHERE ' + conditions.join(' AND ');
    fullQuery += ' ORDER BY st.last_name, st.first_name, s.name';
    const [rows] = await pool.query(fullQuery, params);
    res.json(rows);
  } catch (err) {
    console.error('getMarks error:', err);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
};

exports.upsertMarks = async (req, res) => {
  try {
    const { marks } = req.body;
    if (!marks || !marks.length) return res.status(400).json({ error: 'Marks array is required' });
    const upsertQuery = [
      'INSERT INTO student_marks (student_id, subject_id, exam_id, marks, max_marks, remarks)',
      'VALUES (?, ?, ?, ?, ?, ?)',
      'ON DUPLICATE KEY UPDATE marks = VALUES(marks), max_marks = VALUES(max_marks), remarks = VALUES(remarks)',
    ].join(' ');
    for (const m of marks) {
      if (!m.student_id || !m.subject_id || !m.exam_id || m.marks === undefined) {
        return res.status(400).json({ error: 'student_id, subject_id, exam_id, and marks are required' });
      }
      await pool.query(upsertQuery, [m.student_id, m.subject_id, m.exam_id, m.marks, m.max_marks || 100, m.remarks || null]);
    }
    res.json({ message: marks.length + ' mark(s) saved' });
  } catch (err) {
    console.error('upsertMarks error:', err);
    res.status(500).json({ error: 'Failed to save marks' });
  }
};

exports.deleteMark = async (req, res) => {
  try {
    await pool.query('DELETE FROM student_marks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mark deleted' });
  } catch (err) {
    console.error('deleteMark error:', err);
    res.status(500).json({ error: 'Failed to delete mark' });
  }
};

exports.getReportCard = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    const [[student]] = await pool.query(
      'SELECT st.*, c.name AS class_name, c.section, ' +
      'p.first_name AS parent_first, p.last_name AS parent_last, p.email AS parent_email, p.phone AS parent_phone ' +
      'FROM students st LEFT JOIN classes c ON st.class_id = c.id ' +
      'LEFT JOIN parents p ON st.parent_id = p.id WHERE st.id = ?', [studentId]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [[exam]] = await pool.query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const [marks] = await pool.query(
      'SELECT sm.*, s.name AS subject_name, s.code AS subject_code ' +
      'FROM student_marks sm JOIN subjects s ON sm.subject_id = s.id ' +
      'WHERE sm.student_id = ? AND sm.exam_id = ? ORDER BY s.name', [studentId, examId]);

    const [classAverages] = await pool.query(
      `SELECT sm.student_id, ROUND((SUM(sm.marks) / NULLIF(SUM(sm.max_marks), 0)) * 100, 1) AS average
       FROM student_marks sm
       JOIN students st ON st.id = sm.student_id
       WHERE sm.exam_id = ? AND st.class_id = ?
       GROUP BY sm.student_id
       ORDER BY average DESC`,
      [examId, student.class_id]
    );

    const totalMarks = marks.reduce((sum, m) => sum + parseFloat(m.marks), 0);
    const totalMax = marks.reduce((sum, m) => sum + parseFloat(m.max_marks), 0);
    const average = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

    let grade = 'F';
    const avg = parseFloat(average);
    if (avg >= 90) grade = 'A+';
    else if (avg >= 80) grade = 'A';
    else if (avg >= 70) grade = 'B+';
    else if (avg >= 60) grade = 'B';
    else if (avg >= 50) grade = 'C+';
    else if (avg >= 40) grade = 'C';
    else if (avg >= 30) grade = 'D';

    const currentAverage = parseFloat(average) || 0;
    const position = classAverages.findIndex((row) => row.student_id === student.id) + 1;
    res.json({
      student,
      exam,
      marks,
      schoolInfo: await getSchoolInfo(),
      summary: { totalMarks, totalMax, average, grade, classPosition: position || null, classSize: classAverages.length },
    });
  } catch (err) {
    console.error('getReportCard error:', err);
    res.status(500).json({ error: 'Failed to generate report card' });
  }
};

async function getSchoolInfo() {
  const [rows] = await pool.query(
    `SELECT info_key, info_value FROM school_info
     WHERE info_key IN ('school_name', 'school_location', 'contact_address', 'contact_phone', 'contact_email', 'contact_hours', 'logo_url')`
  );
  return rows.reduce((info, row) => ({ ...info, [row.info_key]: row.info_value }), {});
}

exports.getReportCardByExamName = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { exam_type, academic_year } = req.query;
    if (!exam_type || !academic_year) return res.status(400).json({ error: 'exam_type and academic_year are required' });

    const [[student]] = await pool.query(
      'SELECT st.*, c.name AS class_name, c.section, ' +
      'p.first_name AS parent_first, p.last_name AS parent_last ' +
      'FROM students st LEFT JOIN classes c ON st.class_id = c.id ' +
      'LEFT JOIN parents p ON st.parent_id = p.id WHERE st.id = ?', [studentId]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [[exam]] = await pool.query('SELECT * FROM exams WHERE type = ? AND academic_year = ?', [exam_type, academic_year]);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const [marks] = await pool.query(
      'SELECT sm.*, s.name AS subject_name, s.code AS subject_code ' +
      'FROM student_marks sm JOIN subjects s ON sm.subject_id = s.id ' +
      'WHERE sm.student_id = ? AND sm.exam_id = ? ORDER BY s.name', [studentId, exam.id]);

    const totalMarks = marks.reduce((sum, m) => sum + parseFloat(m.marks), 0);
    const totalMax = marks.reduce((sum, m) => sum + parseFloat(m.max_marks), 0);
    const average = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

    let grade = 'F';
    const avg = parseFloat(average);
    if (avg >= 90) grade = 'A+';
    else if (avg >= 80) grade = 'A';
    else if (avg >= 70) grade = 'B+';
    else if (avg >= 60) grade = 'B';
    else if (avg >= 50) grade = 'C+';
    else if (avg >= 40) grade = 'C';
    else if (avg >= 30) grade = 'D';

    res.json({ student, exam, marks, summary: { totalMarks, totalMax, average, grade } });
  } catch (err) {
    console.error('getReportCardByExamName error:', err);
    res.status(500).json({ error: 'Failed to generate report card' });
  }
};
