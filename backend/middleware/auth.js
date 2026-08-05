const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'greenfield-academy-secret-key-2026';

function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { adminAuth, JWT_SECRET };
