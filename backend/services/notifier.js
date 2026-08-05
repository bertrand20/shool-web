const pool = require('../config/database');

let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || '' }
        : undefined,
    });
  }
} catch {
  transporter = null;
}

async function isEnabled(settingKey) {
  try {
    const [rows] = await pool.query(
      'SELECT setting_value FROM notification_settings WHERE setting_key = ?',
      [settingKey]
    );
    return rows.length === 0 ? true : Boolean(rows[0].setting_value);
  } catch {
    return true;
  }
}

async function resolveRecipient(recipientType, recipientId) {
  if (recipientType === 'student') {
    const [rows] = await pool.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name, email FROM students WHERE id = ?',
      [recipientId]
    );
    return rows[0] || null;
  }
  if (recipientType === 'parent') {
    const [rows] = await pool.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name, email FROM parents WHERE id = ?',
      [recipientId]
    );
    return rows[0] || null;
  }
  if (recipientType === 'staff') {
    const [rows] = await pool.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name, email FROM staff WHERE id = ?',
      [recipientId]
    );
    return rows[0] || null;
  }
  return null;
}

async function sendNotification({ recipientType = 'parent', recipientId, subject, body, channel = 'email', settingKey = null }) {
  try {
    if (settingKey) {
      const enabled = await isEnabled(settingKey);
      if (!enabled) return { logged: false, reason: 'disabled' };
    }

    const recipient = await resolveRecipient(recipientType, recipientId);
    const to = recipient ? recipient.email : null;

    let status = 'logged';
    if (transporter && to && channel === 'email') {
      try {
        await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@greenfieldacademy.edu', to, subject, html: `<p>${body}</p>` });
        status = 'sent';
      } catch {
        status = 'failed';
      }
    }

    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, channel, subject, body, status, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recipientType, recipientId, channel, subject, body, status, status === 'sent' ? new Date() : null]
    );

    return { logged: true, status, to };
  } catch (err) {
    console.error('sendNotification error:', err);
    return { logged: false, error: err.message };
  }
}

module.exports = { sendNotification, isEnabled, transporter };
