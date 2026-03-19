const express = require('express');
const router = express.Router();
const { db } = require('../models/db');

router.get('/', (req, res) => {
  const { status, search, year, department } = req.query;
  let where = [];
  let params = [];

  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (year) {
    where.push('graduationYear = ?');
    params.push(year);
  }
  if (department) {
    where.push('department = ?');
    params.push(department);
  }
  if (search) {
    where.push('(name LIKE ? OR organization LIKE ? OR position LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const sql = `SELECT * FROM students ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY createdAt DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name, graduationYear, department, status, organization, position, location, notes } = req.body;
  if (!name || !status) {
    return res.status(400).json({ error: 'name and status are required' });
  }
  const sql = `INSERT INTO students (name, graduationYear, department, status, organization, position, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [name, graduationYear || null, department || null, status, organization || null, position || null, location || null, notes || null];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM students WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
});

router.put('/:id', (req, res) => {
  const { name, graduationYear, department, status, organization, position, location, notes } = req.body;
  const id = req.params.id;
  const sql = `UPDATE students SET name = ?, graduationYear = ?, department = ?, status = ?, organization = ?, position = ?, location = ?, notes = ? WHERE id = ?`;
  const params = [name, graduationYear || null, department || null, status, organization || null, position || null, location || null, notes || null, id];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
    db.get('SELECT * FROM students WHERE id = ?', [id], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(row);
    });
  });
});

router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM students WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
