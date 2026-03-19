const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'alumni.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database', err);
    process.exit(1);
  }
});

const init = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      graduationYear INTEGER,
      department TEXT,
      status TEXT NOT NULL,
      organization TEXT,
      position TEXT,
      location TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(sql);
};

module.exports = { db, init };
