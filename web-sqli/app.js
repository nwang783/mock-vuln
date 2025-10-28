// Intentionally vulnerable: SQL injection via string concatenation
// DO NOT DEPLOY. For detector testing only.
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  db.run("INSERT INTO users (name) VALUES ('alice'), ('bob')");
});

// vulnerable: builds SQL from untrusted input
app.get('/user', (req, res) => {
  const id = req.query.id; // untrusted input
  const sql = 'SELECT * FROM users WHERE id = ' + id; // vulnerable pattern
  db.get(sql, (err, row) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(row || {});
  });
});

if (require.main === module) {
  app.listen(3001, () => console.log('web-sqli listening on :3001'));
}

module.exports = app;
