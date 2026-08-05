const pool = require('../config/database');
const { logAudit } = require('../middleware/audit');

exports.getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY title';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getBooks error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, total_copies, shelf_location } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const copies = parseInt(total_copies) || 1;
    const [result] = await pool.query(
      `INSERT INTO books (title, author, isbn, category, total_copies, available_copies, shelf_location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, author || null, isbn || null, category || null, copies, copies, shelf_location || null]
    );
    await logAudit(req, 'create', 'book', result.insertId, req.body);
    res.status(201).json({ message: 'Book added', id: result.insertId });
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, author, isbn, category, shelf_location } = req.body;
    const [result] = await pool.query(
      `UPDATE books SET
       title = COALESCE(?, title), author = COALESCE(?, author), isbn = COALESCE(?, isbn),
       category = COALESCE(?, category), shelf_location = COALESCE(?, shelf_location)
       WHERE id = ?`,
      [title, author, isbn, category, shelf_location, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    await logAudit(req, 'update', 'book', req.params.id, req.body);
    res.json({ message: 'Book updated' });
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    await logAudit(req, 'delete', 'book', req.params.id, null);
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error('deleteBook error:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { status } = req.query;
    let query = [
      'SELECT bi.*, b.title AS book_title, b.author AS book_author,',
      'CONCAT(s.first_name, " ", s.last_name) AS student_name, s.email AS student_email',
      'FROM book_issues bi',
      'JOIN books b ON bi.book_id = b.id',
      'JOIN students s ON bi.student_id = s.id',
    ].join(' ');
    const conditions = [];
    const params = [];
    if (status === 'overdue') {
      conditions.push("bi.status = 'Issued' AND bi.due_date < CURDATE()");
    } else if (status) {
      conditions.push('bi.status = ?');
      params.push(status);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY bi.issue_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getIssues error:', err);
    res.status(500).json({ error: 'Failed to fetch book issues' });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { book_id, student_id, due_date, notes } = req.body;
    if (!book_id || !student_id || !due_date) {
      return res.status(400).json({ error: 'book_id, student_id, and due_date are required' });
    }
    const [bookRows] = await pool.query('SELECT available_copies FROM books WHERE id = ?', [book_id]);
    if (bookRows.length === 0) return res.status(404).json({ error: 'Book not found' });
    if (bookRows[0].available_copies <= 0) return res.status(400).json({ error: 'No copies available' });

    const [result] = await pool.query(
      'INSERT INTO book_issues (book_id, student_id, due_date, notes) VALUES (?, ?, ?, ?)',
      [book_id, student_id, due_date, notes || null]
    );
    await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
    await logAudit(req, 'issue', 'book', result.insertId, req.body);
    res.status(201).json({ message: 'Book issued', id: result.insertId });
  } catch (err) {
    console.error('issueBook error:', err);
    res.status(500).json({ error: 'Failed to issue book' });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const [issueRows] = await pool.query('SELECT * FROM book_issues WHERE id = ?', [req.params.id]);
    if (issueRows.length === 0) return res.status(404).json({ error: 'Issue record not found' });
    const issue = issueRows[0];
    if (issue.status === 'Returned') return res.status(400).json({ error: 'Book already returned' });

    await pool.query(
      'UPDATE book_issues SET status = ?, return_date = CURDATE() WHERE id = ?',
      ['Returned', req.params.id]
    );
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [issue.book_id]);
    await logAudit(req, 'return', 'book', req.params.id, null);
    res.json({ message: 'Book returned' });
  } catch (err) {
    console.error('returnBook error:', err);
    res.status(500).json({ error: 'Failed to return book' });
  }
};

exports.getLibrarySummary = async (_req, res) => {
  try {
    const [books] = await pool.query('SELECT COUNT(*) AS total_books, SUM(available_copies) AS available FROM books');
    const [issued] = await pool.query("SELECT COUNT(*) AS issued FROM book_issues WHERE status = 'Issued'");
    const [overdue] = await pool.query("SELECT COUNT(*) AS overdue FROM book_issues WHERE status = 'Issued' AND due_date < CURDATE()");
    res.json({
      total_books: books[0].total_books || 0,
      available: books[0].available || 0,
      issued: issued[0].issued || 0,
      overdue: overdue[0].overdue || 0,
    });
  } catch (err) {
    console.error('getLibrarySummary error:', err);
    res.status(500).json({ error: 'Failed to fetch library summary' });
  }
};
