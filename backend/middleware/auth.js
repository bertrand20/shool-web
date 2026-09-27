const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

async function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const [[admin]] = await pool.query(
      'SELECT id, username, full_name, role FROM admin_users WHERE id = ?',
      [decoded.id]
    );
    if (!admin) return res.status(401).json({ error: 'Admin account not found' });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { adminAuth, JWT_SECRET };
