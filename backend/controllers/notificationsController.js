const pool = require('../config/database');
const { sendNotification, isEnabled } = require('../services/notifier');
const { logAudit } = require('../middleware/audit');

exports.getSettings = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notification_settings ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('getSettings error:', err);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO notification_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value ? 1 : 0]
      );
    }
    await logAudit(req, 'update', 'notification_settings', null, settings);
    const [rows] = await pool.query('SELECT * FROM notification_settings ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('updateSettings error:', err);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const [rows] = await pool.query(
      `SELECT n.*,
       CASE n.recipient_type
         WHEN 'parent' THEN (SELECT CONCAT(p.first_name, " ", p.last_name) FROM parents p WHERE p.id = n.recipient_id)
         WHEN 'student' THEN (SELECT CONCAT(s.first_name, " ", s.last_name) FROM students s WHERE s.id = n.recipient_id)
         WHEN 'staff' THEN (SELECT CONCAT(st.first_name, " ", st.last_name) FROM staff st WHERE st.id = n.recipient_id)
       END AS recipient_name
       FROM notifications n ORDER BY n.created_at DESC LIMIT ?`,
      [parseInt(limit) || 50]
    );
    res.json(rows);
  } catch (err) {
    console.error('getLogs error:', err);
    res.status(500).json({ error: 'Failed to fetch notification logs' });
  }
};

exports.sendManual = async (req, res) => {
  try {
    const { recipient_type, recipient_id, subject, body, channel = 'email' } = req.body;
    if (!recipient_type || !recipient_id || !subject || !body) {
      return res.status(400).json({ error: 'recipient_type, recipient_id, subject, and body are required' });
    }
    const result = await sendNotification({ recipientType: recipient_type, recipientId: recipient_id, subject, body, channel });
    await logAudit(req, 'send', 'notification', null, req.body);
    res.json(result);
  } catch (err) {
    console.error('sendManual error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

exports.sendFeeReminders = async (req, res) => {
  try {
    const enabled = await isEnabled('fee_reminders');
    if (!enabled) return res.json({ message: 'Fee reminders are disabled', sent: 0 });
    const [outstanding] = await pool.query(
      `SELECT s.id AS student_id, s.parent_id, s.first_name, s.last_name,
              COALESCE(SUM(f.amount), 0) - COALESCE(SUM(fp.amount_paid), 0) AS balance,
              CONCAT(p.first_name, " ", p.last_name) AS parent_name, p.email
       FROM students s
       JOIN classes c ON s.class_id = c.id
       JOIN fees f ON f.class_id = s.class_id
       LEFT JOIN fee_payments fp ON fp.student_id = s.id AND fp.fee_id = f.id
       LEFT JOIN parents p ON s.parent_id = p.id
       WHERE s.status = 'Active' AND s.parent_id IS NOT NULL
       GROUP BY s.id, s.parent_id, p.first_name, p.last_name, p.email
       HAVING balance > 0`
    );
    let sent = 0;
    for (const row of outstanding) {
      await sendNotification({
        recipientType: 'parent',
        recipientId: row.parent_id,
        subject: `Fee Reminder for ${row.first_name} ${row.last_name}`,
        body: `Dear ${row.parent_name}, the outstanding fee balance for ${row.first_name} is ${parseFloat(row.balance).toFixed(2)}. Please pay before the due date.`,
        settingKey: 'fee_reminders',
      });
      sent++;
    }
    await logAudit(req, 'send', 'fee_reminders', null, { sent });
    res.json({ message: `Sent ${sent} fee reminder(s)`, sent });
  } catch (err) {
    console.error('sendFeeReminders error:', err);
    res.status(500).json({ error: 'Failed to send fee reminders' });
  }
};

exports.sendAttendanceAlerts = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const [absentees] = await pool.query(
      `SELECT a.student_id, s.first_name, s.last_name, s.parent_id, p.email
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN parents p ON s.parent_id = p.id
       WHERE a.date = ? AND a.status = 'Absent'`
    , [targetDate]);
    let sent = 0;
    for (const row of absentees) {
      await sendNotification({
        recipientType: 'parent',
        recipientId: row.parent_id,
        subject: `Attendance Alert: ${row.first_name} ${row.last_name}`,
        body: `Your child ${row.first_name} ${row.last_name} was marked Absent on ${targetDate}. Please contact the school office.`,
        settingKey: 'attendance_alerts',
      });
      sent++;
    }
    await logAudit(req, 'send', 'attendance_alerts', null, { date: targetDate, sent });
    res.json({ message: `Sent ${sent} attendance alert(s)`, sent });
  } catch (err) {
    console.error('sendAttendanceAlerts error:', err);
    res.status(500).json({ error: 'Failed to send attendance alerts' });
  }
};
