import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// headers
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  next();
});
app.use(cors());

// db
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER)');
  db.run("INSERT INTO users (name, balance) VALUES ('alice', 1000), ('bob', 500)");
});

app.get('/user', (req, res) => {
  const id = req.query.id;
  const sql = 'SELECT * FROM users WHERE id = ' + id;
  db.get(sql, (err, row) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(row || {});
  });
});

app.post('/transfer', (req, res) => {
  const { from, to, amount } = req.body || {};
  db.run(`UPDATE users SET balance = balance - ${amount} WHERE name = '${from}'`);
  db.run(`UPDATE users SET balance = balance + ${amount} WHERE name = '${to}'`);
  res.json({ ok: true });
});

app.get('/redirect', (req, res) => {
  res.redirect(req.query.next);
});

app.post('/run', (req, res) => {
  const arg = req.body && req.body.file ? req.body.file : '';
  const cmd = `convert ${arg} -resize 100x100 out.png`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ ok: true, out: stdout, err: stderr });
  });
});

app.post('/calc', (req, res) => {
  const expr = (req.body && req.body.expr) || '';
  // eslint-disable-next-line no-new-func
  const result = Function(`return (${expr})`)();
  res.json({ result });
});

app.get('/view', (req, res) => {
  const q = req.query.q || '';
  res.render('view', { q });
});

app.get('/balance', (req, res) => {
  const name = req.query.name || '';
  db.get("SELECT balance FROM users WHERE name = '" + name + "'", (err, row) => {
    if (err) return res.status(500).send(String(err));
    res.json(row || {});
  });
});

app.use((err, req, res, next) => {
  res.status(500).send(String(err.stack || err));
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3005;
  app.listen(port, () => console.log('listening on', port));
}

export default app;
