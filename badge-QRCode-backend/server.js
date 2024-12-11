// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
/* const mysql = require('mysql2'); */

const app = express();
const port = 3000;

// Configura il middleware
app.use(cors());
app.use(bodyParser.json());

/* // Configura la connessione al database MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', // Cambia con il tuo utente MySQL
  //password: 'password', // Cambia con la tua password MySQL // mia
  password: 'root', // Cambia con la tua password MySQL // f2
  database: 'QRCode', // Cambia con il nome del tuo database
  port: 3306
});

// Collega al database
db.connect(err => {
  if (err) throw err;
  console.log('Connesso al database MySQL');
}); */

// Endpoint per aggiungere un utente
app.post('/api/scan', (req, res) => {
  switch (req.body.keyQRCode) {
    case 'm.rossi@f2.it1733845554':
      return res.status(200).json(
        {
          email: "m.rossi@f2.it",
          nome_cognome: "Mario Rossi",	
          id_timbratura: "",
          Ultima_timbratura: ""
        },
      );
      case 'a.bianchi@f2.it1733845586':
        return res.status(200).json(
          {
            email: "a.bianchi@f2.it",
            nome_cognome: "Alberto Bianchi",	
            id_timbratura: "JISDHU-SFFS-SFGSSF-SFSF",
            ultima_timbratura: "E"
          },
        );
        default:
          err = 'utente non riconosciuto'
          return res.status(500).send(err);
        };

/*   const { user, date } = req.body;

  const checkQuery = 'SELECT * FROM scans WHERE user = ?';
  db.query(checkQuery, [user], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (results.length > 0) {
      // L'utente esiste già, non fare nulla
      return res.status(200).json({ message: 'Utente già registrato' });
      } */
     
     // Aggiungi un nuovo record
/* 
    // se non si passa la data dal front end
    const insertQuery = 'INSERT INTO scans (user) VALUES (?)';

    db.query(insertQuery, [user], (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ message: 'Utente registrato con successo' });
    });
 */
/*     //  se passo la data dal front end
    const insertQuery = 'INSERT INTO scans (user, date) VALUES (?, ?)';
    const timestamp = new Date(date * 1000).toISOString().slice(0, 19).replace('T', ' '); // Converte Unix timestamp in formato TIMESTAMP

    db.query(insertQuery, [user, timestamp], (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ message: 'Utente registrato con successo' });
    }); */
  /* }); */
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

// Endpoint per timbrare
app.post('/api/stamp', (req, res) => {
/* req {
  nome
  cognome
  indirizzo (email)
} */

  return res.status(200).json(
    {
      message: "QR code creato correttamente",
      qrCodeUrl: "https://gestione-cv-documenti-personali.s3.amazonaws.com/05e26c9a9b87bd60cb2f16fcc5918341/Gabriele Dibennardo QRcode.png"
    },
  );

});

// Avvia il server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});