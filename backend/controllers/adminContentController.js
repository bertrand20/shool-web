const pool = require('../config/database');

exports.getAllAnnouncements = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAllAnnouncements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, image_url, priority, is_published } = req.body;
    const [result] = await pool.query(
      'INSERT INTO announcements (title, content, image_url, priority, is_published) VALUES (?, ?, ?, ?, ?)',
      [title, content, image_url || null, priority || 'Medium', is_published !== undefined ? is_published : 1]
    );
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createAnnouncement error:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, content, image_url, priority, is_published } = req.body;
    const [result] = await pool.query(
      `UPDATE announcements SET title = COALESCE(?, title), content = COALESCE(?, content),
       image_url = COALESCE(?, image_url), priority = COALESCE(?, priority), is_published = COALESCE(?, is_published)
       WHERE id = ?`,
      [title, content, image_url, priority, is_published, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Announcement not found' });
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateAnnouncement error:', err);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error('deleteAnnouncement error:', err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

exports.getAllGallery = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAllGallery error:', err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

exports.createGalleryItem = async (req, res) => {
  try {
    const { title, image_url, category, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO gallery (title, image_url, category, description) VALUES (?, ?, ?, ?)',
      [title, image_url, category || 'School', description || null]
    );
    const [rows] = await pool.query('SELECT * FROM gallery WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createGalleryItem error:', err);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    console.error('deleteGalleryItem error:', err);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
};

exports.updateSchoolInfo = async (req, res) => {
  try {
    const { info } = req.body;
    if (!info || typeof info !== 'object') {
      return res.status(400).json({ error: 'Info object is required' });
    }

    for (const [key, value] of Object.entries(info)) {
      await pool.query(
        `INSERT INTO school_info (info_key, info_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE info_value = ?`,
        [key, value, value]
      );
    }

    const [rows] = await pool.query('SELECT * FROM school_info');
    const result = {};
    rows.forEach((row) => {
      result[row.info_key] = row.info_value;
    });
    res.json(result);
  } catch (err) {
    console.error('updateSchoolInfo error:', err);
    res.status(500).json({ error: 'Failed to update school info' });
  }
};

exports.getSchoolInfo = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM school_info');
    const info = {};
    rows.forEach((row) => {
      info[row.info_key] = row.info_value;
    });
    res.json(info);
  } catch (err) {
    console.error('getSchoolInfo error:', err);
    res.status(500).json({ error: 'Failed to fetch school info' });
  }
};
