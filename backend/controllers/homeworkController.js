const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');
const { sendNotification } = require('../services/notifier');

exports.getHomework = async (req, res) => {
  try {
    const { class_id, staff_id, subject_id, status } = req.query;
    let query = [
      'SELECT h.*, c.name AS class_name, c.section,',
      's.name AS subject_name,',
      'CONCAT(st.first_name, " ", st.last_name) AS teacher_name',
      'FROM homework_assignments h',
      'LEFT JOIN classes c ON h.class_id = c.id',
      'LEFT JOIN subjects s ON h.subject_id = s.id',
      'LEFT JOIN staff st ON h.staff_id = st.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (class_id) { conditions.push('h.class_id = ?'); params.push(class_id); }
    if (staff_id) { conditions.push('h.staff_id = ?'); params.push(staff_id); }
    if (subject_id) { conditions.push('h.subject_id = ?'); params.push(subject_id); }
    if (status === 'upcoming') conditions.push('h.due_date >= CURDATE()');
    if (status === 'overdue') conditions.push('h.due_date < CURDATE()');
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY h.due_date';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getHomework error:', err);
    res.status(500).json({ error: 'Failed to fetch homework' });
  }
};

exports.createHomework = async (req, res) => {
  try {
    const { class_id, subject_id, staff_id, title, description, due_date, priority } = req.body;
    if (!class_id || !title || !due_date) {
      return res.status(400).json({ error: 'class_id, title, and due_date are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO homework_assignments (class_id, subject_id, staff_id, title, description, due_date, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [class_id, subject_id || null, staff_id || null, title, description || null, due_date, priority || 'Medium']
    );
    await logAudit(req, 'create', 'homework', result.insertId, req.body);

    const [students] = await pool.query('SELECT id FROM students WHERE class_id = ? AND status = ?', [class_id, 'Active']);
    for (const s of students) {
      const parentInfo = await pool.query('SELECT parent_id FROM students WHERE id = ?', [s.id]);
      const parentId = parentInfo[0][0]?.parent_id;
      if (parentId) {
        await sendNotification({
          recipientType: 'parent',
          recipientId: parentId,
          subject: `New Homework: ${title}`,
          body: `A new ${priority || 'Medium'} priority assignment "${title}" has been posted. Due date: ${due_date}.`,
          settingKey: 'homework_updates',
        });
      }
    }

    res.status(201).json({ message: 'Homework created', id: result.insertId });
  } catch (err) {
    console.error('createHomework error:', err);
    res.status(500).json({ error: 'Failed to create homework' });
  }
};

exports.updateHomework = async (req, res) => {
  try {
    const { class_id, subject_id, staff_id, title, description, due_date, priority } = req.body;
    const [result] = await pool.query(
      `UPDATE homework_assignments SET
       class_id = COALESCE(?, class_id),
       subject_id = COALESCE(?, subject_id),
       staff_id = COALESCE(?, staff_id),
       title = COALESCE(?, title),
       description = COALESCE(?, description),
       due_date = COALESCE(?, due_date),
       priority = COALESCE(?, priority)
       WHERE id = ?`,
      [class_id, subject_id, staff_id, title, description, due_date, priority, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Homework not found' });
    await logAudit(req, 'update', 'homework', req.params.id, req.body);
    res.json({ message: 'Homework updated' });
  } catch (err) {
    console.error('updateHomework error:', err);
    res.status(500).json({ error: 'Failed to update homework' });
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM homework_assignments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Homework not found' });
    await logAudit(req, 'delete', 'homework', req.params.id, null);
    res.json({ message: 'Homework removed' });
  } catch (err) {
    console.error('deleteHomework error:', err);
    res.status(500).json({ error: 'Failed to delete homework' });
  }
};
