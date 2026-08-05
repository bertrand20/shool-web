const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getItems = async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (low_stock === '1') { query += ' AND quantity <= min_stock'; }
    query += ' ORDER BY item_name';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getItems error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { item_name, category, quantity, unit, min_stock, unit_cost, location, supplier, notes } = req.body;
    if (!item_name) return res.status(400).json({ error: 'item_name is required' });
    const [result] = await pool.query(
      `INSERT INTO inventory_items (item_name, category, quantity, unit, min_stock, unit_cost, location, supplier, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item_name, category || 'Other', quantity || 0, unit || null, min_stock || 0, unit_cost || 0, location || null, supplier || null, notes || null]
    );
    await logAudit(req, 'create', 'inventory_item', result.insertId, req.body);
    res.status(201).json({ message: 'Inventory item added', id: result.insertId });
  } catch (err) {
    console.error('createItem error:', err);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { item_name, category, quantity, unit, min_stock, unit_cost, location, supplier, notes } = req.body;
    const [result] = await pool.query(
      `UPDATE inventory_items SET
       item_name = COALESCE(?, item_name), category = COALESCE(?, category),
       quantity = COALESCE(?, quantity), unit = COALESCE(?, unit),
       min_stock = COALESCE(?, min_stock), unit_cost = COALESCE(?, unit_cost),
       location = COALESCE(?, location), supplier = COALESCE(?, supplier),
       notes = COALESCE(?, notes)
       WHERE id = ?`,
      [item_name, category, quantity, unit, min_stock, unit_cost, location, supplier, notes, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory item not found' });
    await logAudit(req, 'update', 'inventory_item', req.params.id, req.body);
    res.json({ message: 'Inventory item updated' });
  } catch (err) {
    console.error('updateItem error:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });
    const [result] = await pool.query(
      'UPDATE inventory_items SET quantity = GREATEST(0, quantity + ?) WHERE id = ?',
      [parseInt(quantity) || 0, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory item not found' });
    await logAudit(req, 'stock_adjust', 'inventory_item', req.params.id, { quantity });
    res.json({ message: 'Stock adjusted' });
  } catch (err) {
    console.error('adjustStock error:', err);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM inventory_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory item not found' });
    await logAudit(req, 'delete', 'inventory_item', req.params.id, null);
    res.json({ message: 'Inventory item removed' });
  } catch (err) {
    console.error('deleteItem error:', err);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

exports.getInventorySummary = async (_req, res) => {
  try {
    const [summary] = await pool.query(
      'SELECT COUNT(*) AS items, COALESCE(SUM(quantity),0) AS total_qty, COALESCE(SUM(quantity * unit_cost),0) AS total_value FROM inventory_items'
    );
    const [lowStock] = await pool.query(
      'SELECT COUNT(*) AS count FROM inventory_items WHERE quantity <= min_stock'
    );
    res.json({ items: summary[0].items, total_qty: summary[0].total_qty, total_value: summary[0].total_value, low_stock: lowStock[0].count });
  } catch (err) {
    console.error('getInventorySummary error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
};
