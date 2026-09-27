const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  SCHOOL_ADMIN: [
    'students:read', 'students:write', 'parents:read', 'parents:write',
    'staff:read', 'staff:write', 'attendance:read', 'attendance:write',
    'academic:read', 'academic:write', 'finance:read', 'finance:write',
    'operations:read', 'operations:write', 'content:read', 'content:write',
    'audit:read', 'reports:read', 'system:write',
  ],
  ACADEMIC_ADMIN: ['students:read', 'parents:read', 'staff:read', 'attendance:read', 'attendance:write', 'academic:read', 'academic:write', 'content:read'],
  FINANCE_ADMIN: ['students:read', 'parents:read', 'finance:read', 'finance:write', 'reports:read'],
  HR_ADMIN: ['staff:read', 'staff:write', 'operations:read', 'operations:write', 'reports:read'],
  CONTENT_EDITOR: ['content:read', 'content:write'],
  TEACHER: ['students:read', 'attendance:read', 'attendance:write', 'academic:read', 'academic:write'],
};

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    if (!hasPermission(req.admin.role, permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

const OPERATIONAL_PERMISSIONS = [
  { prefix: '/students', permission: 'students' },
  { prefix: '/parents', permission: 'parents' },
  { prefix: '/attendance', permission: 'attendance' },
  { prefix: '/fees', permission: 'finance' },
  { prefix: '/payments', permission: 'finance' },
  { prefix: '/outstanding', permission: 'finance' },
  { prefix: '/revenue', permission: 'finance' },
  { prefix: '/staff', permission: 'staff' },
  { prefix: '/subjects', permission: 'academic' },
  { prefix: '/exams', permission: 'academic' },
  { prefix: '/marks', permission: 'academic' },
  { prefix: '/report-card', permission: 'academic' },
  { prefix: '/timetable', permission: 'academic' },
  { prefix: '/homework', permission: 'academic' },
  { prefix: '/notifications', permission: 'operations' },
  { prefix: '/reports', permission: 'reports' },
  { prefix: '/library', permission: 'operations' },
  { prefix: '/transport', permission: 'operations' },
  { prefix: '/health', permission: 'operations' },
  { prefix: '/payroll', permission: 'operations' },
  { prefix: '/leave', permission: 'operations' },
  { prefix: '/events', permission: 'content' },
  { prefix: '/behavior', permission: 'operations' },
  { prefix: '/inventory', permission: 'operations' },
  { prefix: '/audit-logs', permission: 'audit' },
  { prefix: '/certificates', permission: 'students' },
];

function authorizeOperational(req, res, next) {
  const match = OPERATIONAL_PERMISSIONS.find(({ prefix }) => req.path === prefix || req.path.startsWith(`${prefix}/`));
  if (!match) return next();
  const action = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? 'write' : 'read';
  return requirePermission(`${match.permission}:${action}`)(req, res, next);
}

module.exports = { ROLE_PERMISSIONS, hasPermission, requirePermission, requireRoles, authorizeOperational };
