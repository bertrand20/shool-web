const pool = require('../config/database');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.createMessage = async (req, res) => {
  const { name, email, phone, subject, message, website } = req.body || {};

  if (website) return res.status(400).json({ error: 'Invalid submission' });
  if (!name || name.trim().length < 2 || name.trim().length > 120) {
    return res.status(400).json({ error: 'Name must be between 2 and 120 characters' });
  }
  if (!email || !emailPattern.test(email) || email.length > 255) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  if (!subject || subject.trim().length < 2 || subject.trim().length > 200) {
    return res.status(400).json({ error: 'Subject must be between 2 and 200 characters' });
  }
  if (!message || message.trim().length < 10 || message.trim().length > 5000) {
    return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, subject.trim(), message.trim()]
    );
    res.status(201).json({ message: 'Your message has been received.', id: result.insertId });
  } catch (err) {
    console.error('createMessage error:', err);
    res.status(500).json({ error: 'Unable to send your message' });
  }
};

exports.getMessages = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

exports.updateMessageStatus = async (req, res) => {
  const allowed = ['New', 'Read', 'Resolved', 'Spam'];
  if (!allowed.includes(req.body?.status)) return res.status(400).json({ error: 'Invalid message status' });
  try {
    const [result] = await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message status updated' });
  } catch (err) {
    console.error('updateMessageStatus error:', err);
    res.status(500).json({ error: 'Unable to update message status' });
  }
};
