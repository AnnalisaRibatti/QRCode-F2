// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configura il middleware
app.use(cors());
app.use(bodyParser.json());

// Configura la connessione al database MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', // Cambia con il tuo utente MySQL
  password: 'password', // Cambia con la tua password MySQL
  database: 'QRCode', // Cambia con il nome del tuo database
  port: 3306
});

// Collega al database
db.connect(err => {
  if (err) throw err;
  console.log('Connesso al database MySQL');
});

// Endpoint per aggiungere un utente
app.post('/api/scan', (req, res) => {
  const { user } = req.body;

  const checkQuery = 'SELECT * FROM scans WHERE user = ?';
  db.query(checkQuery, [user], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (results.length > 0) {
      // L'utente esiste già, non fare nulla
      return res.status(200).json({ message: 'Utente già registrato' });
    }

    // Aggiungi un nuovo record
    const insertQuery = 'INSERT INTO scans (user) VALUES (?)';
    db.query(insertQuery, [user], (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ message: 'Utente registrato con successo' });
    });
  });
});

// Endpoint per ottenere tutti gli utenti registrati
app.get('/api/scans', (req, res) => {
  const query = 'SELECT * FROM scans';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
