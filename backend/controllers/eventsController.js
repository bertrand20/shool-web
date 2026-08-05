const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getEvents = async (req, res) => {
  try {
    const { month, event_type, is_holiday } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query += ' AND DATE_FORMAT(event_date, "%Y-%m") = ?';
      params.push(month);
    }
    if (event_type) { query += ' AND event_type = ?'; params.push(event_type); }
    if (is_holiday !== undefined) { query += ' AND is_holiday = ?'; params.push(is_holiday === '1' ? 1 : 0); }
    query += ' ORDER BY event_date';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, event_date, start_time, end_time, location, event_type, is_holiday } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'title and event_date are required' });
    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, start_time, end_time, location, event_type, is_holiday)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, event_date, start_time || null, end_time || null, location || null, event_type || 'Other', is_holiday ? 1 : 0]
    );
    await logAudit(req, 'create', 'event', result.insertId, req.body);
    res.status(201).json({ message: 'Event created', id: result.insertId });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, description, event_date, start_time, end_time, location, event_type, is_holiday } = req.body;
    const [result] = await pool.query(
      `UPDATE events SET
       title = COALESCE(?, title), description = COALESCE(?, description),
       event_date = COALESCE(?, event_date), start_time = COALESCE(?, start_time),
       end_time = COALESCE(?, end_time), location = COALESCE(?, location),
       event_type = COALESCE(?, event_type), is_holiday = COALESCE(?, is_holiday)
       WHERE id = ?`,
      [title, description, event_date, start_time, end_time, location, event_type, is_holiday, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    await logAudit(req, 'update', 'event', req.params.id, req.body);
    res.json({ message: 'Event updated' });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    await logAudit(req, 'delete', 'event', req.params.id, null);
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
