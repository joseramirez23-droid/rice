const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reach INTEGER NOT NULL,
        impact INTEGER NOT NULL,
        confidence REAL NOT NULL,
        effort REAL NOT NULL,
        score REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ideas', (req, res) => {
  db.all('SELECT * FROM ideas ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error reading ideas:', err.message);
      return res.status(500).json({ error: 'Unable to load ideas' });
    }
    return res.json(rows);
  });
});

app.post('/api/ideas', (req, res) => {
  const { name, reach, impact, confidence, effort } = req.body;

  if (!name || reach == null || impact == null || confidence == null || effort == null) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const reachNum = Number(reach);
  const impactNum = Number(impact);
  const confidenceNum = Number(confidence);
  const effortNum = Number(effort);

  if ([reachNum, impactNum, confidenceNum, effortNum].some((n) => Number.isNaN(n))) {
    return res.status(400).json({ error: 'Los valores numéricos deben ser números válidos.' });
  }

  if (effortNum <= 0) {
    return res.status(400).json({ error: 'El esfuerzo debe ser mayor a 0.' });
  }

  const normalizedConfidence = confidenceNum > 1 ? confidenceNum / 100 : confidenceNum;
  const score = Number(((reachNum * impactNum * normalizedConfidence) / effortNum).toFixed(2));

  const sql = `INSERT INTO ideas (name, reach, impact, confidence, effort, score) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, reachNum, impactNum, normalizedConfidence, effortNum, score];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error saving idea:', err.message);
      return res.status(500).json({ error: 'No se pudo guardar la idea.' });
    }

    return res.status(201).json({
      id: this.lastID,
      name,
      reach: reachNum,
      impact: impactNum,
      confidence: normalizedConfidence,
      effort: effortNum,
      score,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
