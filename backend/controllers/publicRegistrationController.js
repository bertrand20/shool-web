const pool = require('../config/database');

exports.publicRegister = async (req, res) => {
  try {
    const {
      parent_first_name, parent_last_name, parent_email, parent_phone,
      parent_occupation, parent_relationship, parent_address,
      student_first_name, student_last_name, student_email, student_phone,
      student_date_of_birth, student_gender, class_id,
      guardian_name, guardian_phone, student_address,
    } = req.body;

    if (!parent_first_name || !parent_last_name || !parent_email || !parent_phone) {
      return res.status(400).json({ error: 'Parent name, email, and phone are required' });
    }
    if (!student_first_name || !student_last_name || !student_gender) {
      return res.status(400).json({ error: 'Student name and gender are required' });
    }

    let parent_id;

    const [existingParent] = await pool.query('SELECT id FROM parents WHERE email = ?', [parent_email]);

    if (existingParent.length > 0) {
      parent_id = existingParent[0].id;
    } else {
      const [parentResult] = await pool.query(
        `INSERT INTO parents (first_name, last_name, email, phone, occupation, relationship, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          parent_first_name, parent_last_name, parent_email, parent_phone,
          parent_occupation || null, parent_relationship || 'Father', parent_address || null,
        ]
      );
      parent_id = parentResult.insertId;
    }

    const [studentResult] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, phone, date_of_birth, gender, class_id, parent_id, guardian_name, guardian_phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_first_name, student_last_name, student_email || null, student_phone || null,
        student_date_of_birth || null, student_gender, class_id || null, parent_id,
        guardian_name || `${parent_first_name} ${parent_last_name}`,
        guardian_phone || parent_phone, student_address || parent_address || null,
      ]
    );

    const [newStudent] = await pool.query(
      `SELECT s.*, c.name AS class_name, c.section AS class_section
       FROM students s LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [studentResult.insertId]
    );

    const student = newStudent[0];

    res.status(201).json({
      message: 'Student registered successfully',
      student,
      parent_id,
    });
  } catch (err) {
    console.error('publicRegister error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};
