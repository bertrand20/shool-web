const pool = require('../config/database');

async function logAudit(req, action, entityType, entityId, details) {
  try {
    const admin = req.admin || {};
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        admin.id || null,
        admin.full_name || admin.username || 'Admin',
        action,
        entityType || null,
        entityId || null,
        details ? JSON.stringify(details) : null,
        req.ip || null,
      ]
    );
  } catch (err) {
    console.error('logAudit error:', err);
  }
}

module.exports = { logAudit };
