const pool = require('../config/database');

exports.publicRegister = async (req, res) => {
  try {
    const {
      parent_first_name, parent_last_name, parent_email, parent_phone,
      parent_relationship, student_first_name, student_last_name, student_email,
      student_date_of_birth, student_gender, student_age, district, sector, cell, village,
      mother_name, mother_phone, father_name, father_phone, emergency_contact_name,
      emergency_contact_phone, previous_school, medical_information,
    } = req.body;

    if (!parent_first_name || !parent_last_name || !parent_email || !parent_phone) {
      return res.status(400).json({ error: 'Parent name, email, and phone are required' });
    }
    if (!student_first_name || !student_last_name || !student_gender) {
      return res.status(400).json({ error: 'Student name and gender are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO admission_applications
       (parent_first_name, parent_last_name, parent_email, parent_phone, parent_relationship,
        student_first_name, student_last_name, student_email, student_date_of_birth, student_gender,
        student_age, district, sector, cell, village, mother_name, mother_phone, father_name, father_phone,
        emergency_contact_name, emergency_contact_phone, previous_school, medical_information)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        parent_first_name.trim(), parent_last_name.trim(), parent_email.trim().toLowerCase(), parent_phone.trim(),
        parent_relationship || null, student_first_name.trim(), student_last_name.trim(), student_email?.trim().toLowerCase() || null,
        student_date_of_birth || null, student_gender, student_age || null,
        district?.trim() || null, sector?.trim() || null, cell?.trim() || null, village?.trim() || null,
        mother_name?.trim() || null, mother_phone?.trim() || null, father_name?.trim() || null,
        father_phone?.trim() || null, emergency_contact_name?.trim() || null,
        emergency_contact_phone?.trim() || null, previous_school?.trim() || null, medical_information?.trim() || null,
      ]
    );

    res.status(201).json({
      message: 'Your admission application has been received for review.',
      application_id: result.insertId,
    });
  } catch (err) {
    console.error('publicRegister error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email already exists' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};
