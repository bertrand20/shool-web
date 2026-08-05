const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getRoutes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, CONCAT(st.first_name, " ", st.last_name) AS driver_name,
       (SELECT COUNT(*) FROM bus_stops bs WHERE bs.route_id = r.id) AS stop_count,
       (SELECT COUNT(*) FROM transport_assignments ta WHERE ta.route_id = r.id AND ta.status = 'Active') AS assigned_students
       FROM bus_routes r
       LEFT JOIN staff st ON r.driver_staff_id = st.id
       ORDER BY r.route_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('getRoutes error:', err);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const { route_name, vehicle_number, driver_staff_id, start_point, end_point, status } = req.body;
    if (!route_name) return res.status(400).json({ error: 'route_name is required' });
    const [result] = await pool.query(
      `INSERT INTO bus_routes (route_name, vehicle_number, driver_staff_id, start_point, end_point, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [route_name, vehicle_number || null, driver_staff_id || null, start_point || null, end_point || null, status || 'Active']
    );
    await logAudit(req, 'create', 'bus_route', result.insertId, req.body);
    res.status(201).json({ message: 'Route created', id: result.insertId });
  } catch (err) {
    console.error('createRoute error:', err);
    res.status(500).json({ error: 'Failed to create route' });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { route_name, vehicle_number, driver_staff_id, start_point, end_point, status } = req.body;
    const [result] = await pool.query(
      `UPDATE bus_routes SET
       route_name = COALESCE(?, route_name), vehicle_number = COALESCE(?, vehicle_number),
       driver_staff_id = COALESCE(?, driver_staff_id), start_point = COALESCE(?, start_point),
       end_point = COALESCE(?, end_point), status = COALESCE(?, status)
       WHERE id = ?`,
      [route_name, vehicle_number, driver_staff_id, start_point, end_point, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route not found' });
    await logAudit(req, 'update', 'bus_route', req.params.id, req.body);
    res.json({ message: 'Route updated' });
  } catch (err) {
    console.error('updateRoute error:', err);
    res.status(500).json({ error: 'Failed to update route' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM bus_routes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Route not found' });
    await logAudit(req, 'delete', 'bus_route', req.params.id, null);
    res.json({ message: 'Route removed' });
  } catch (err) {
    console.error('deleteRoute error:', err);
    res.status(500).json({ error: 'Failed to delete route' });
  }
};

exports.getStops = async (req, res) => {
  try {
    const { route_id } = req.query;
    let query = 'SELECT bs.*, r.route_name FROM bus_stops bs JOIN bus_routes r ON bs.route_id = r.id';
    const params = [];
    if (route_id) { query += ' WHERE bs.route_id = ?'; params.push(route_id); }
    query += ' ORDER BY bs.pickup_time';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getStops error:', err);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
};

exports.createStop = async (req, res) => {
  try {
    const { route_id, stop_name, pickup_time, drop_time, fare } = req.body;
    if (!route_id || !stop_name) return res.status(400).json({ error: 'route_id and stop_name are required' });
    const [result] = await pool.query(
      'INSERT INTO bus_stops (route_id, stop_name, pickup_time, drop_time, fare) VALUES (?, ?, ?, ?, ?)',
      [route_id, stop_name, pickup_time || null, drop_time || null, fare || 0]
    );
    await logAudit(req, 'create', 'bus_stop', result.insertId, req.body);
    res.status(201).json({ message: 'Stop created', id: result.insertId });
  } catch (err) {
    console.error('createStop error:', err);
    res.status(500).json({ error: 'Failed to create stop' });
  }
};

exports.deleteStop = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM bus_stops WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Stop not found' });
    await logAudit(req, 'delete', 'bus_stop', req.params.id, null);
    res.json({ message: 'Stop removed' });
  } catch (err) {
    console.error('deleteStop error:', err);
    res.status(500).json({ error: 'Failed to delete stop' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ta.*, CONCAT(s.first_name, " ", s.last_name) AS student_name,
       r.route_name, bs.stop_name, c.name AS class_name, c.section
       FROM transport_assignments ta
       JOIN students s ON ta.student_id = s.id
       JOIN bus_routes r ON ta.route_id = r.id
       LEFT JOIN bus_stops bs ON ta.stop_id = bs.id
       LEFT JOIN classes c ON s.class_id = c.id
       ORDER BY s.last_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('getAssignments error:', err);
    res.status(500).json({ error: 'Failed to fetch transport assignments' });
  }
};

exports.assignTransport = async (req, res) => {
  try {
    const { student_id, route_id, stop_id, pickup_time, drop_time, status } = req.body;
    if (!student_id || !route_id) return res.status(400).json({ error: 'student_id and route_id are required' });
    await pool.query(
      `INSERT INTO transport_assignments (student_id, route_id, stop_id, pickup_time, drop_time, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       route_id = VALUES(route_id), stop_id = VALUES(stop_id),
       pickup_time = VALUES(pickup_time), drop_time = VALUES(drop_time),
       status = VALUES(status)`,
      [student_id, route_id, stop_id || null, pickup_time || null, drop_time || null, status || 'Active']
    );
    await logAudit(req, 'assign', 'transport', student_id, req.body);
    res.json({ message: 'Transport assignment saved' });
  } catch (err) {
    console.error('assignTransport error:', err);
    res.status(500).json({ error: 'Failed to assign transport' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM transport_assignments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found' });
    await logAudit(req, 'delete', 'transport_assignment', req.params.id, null);
    res.json({ message: 'Assignment removed' });
  } catch (err) {
    console.error('deleteAssignment error:', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};
