import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

//Check se la directory esiste
function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
}

//Tabelle e metodo per creare il database
export function initDb() {
    ensureDirectoryExistence(DB_PATH);

    const exists = fs.existsSync(DB_PATH);
    const db = new Database(DB_PATH);

    if (!exists) {
        console.log('Creazione del database...');

        db.exec(`
      -- Tabella utenti (clienti e admin)
      CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cognome TEXT NOT NULL,
          telefono TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT 0 NOT NULL
      );

     CREATE TABLE veicoli (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    marca TEXT NOT NULL,
    modello TEXT NOT NULL,
    anno INTEGER,
    targa TEXT NOT NULL,
    cilindrata INTEGER,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utente_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(utente_id, targa)
);

      -- Tabella servizi (tipi di tagliando)
      CREATE TABLE servizi (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          descrizione TEXT,
          durata_minuti INTEGER NOT NULL,
          prezzo REAL NOT NULL
      );

      -- Tabella disponibilità (orari admin)
      CREATE TABLE disponibilita (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          giorno DATE NOT NULL,
          ora_inizio TIME NOT NULL,
          ora_fine TIME NOT NULL,
          CHECK (ora_inizio < ora_fine)
      );

      -- Tabella prenotazioni
      CREATE TABLE prenotazioni (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          utente_id INTEGER NOT NULL,
          veicolo_id INTEGER NOT NULL,
          servizio_id INTEGER NOT NULL,
          data DATE NOT NULL,
          ora_inizio TIME NOT NULL,
          ora_fine TIME NOT NULL,
          stato TEXT DEFAULT 'prenotato' NOT NULL,
          FOREIGN KEY (utente_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (veicolo_id) REFERENCES veicoli(id) ON DELETE CASCADE,
          FOREIGN KEY (servizio_id) REFERENCES servizi(id) ON DELETE CASCADE,
          CHECK (ora_inizio < ora_fine)
      );
      
      -- Tabella codici verifica
      CREATE TABLE verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telefono TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT 0
  );
  

      -- Index
      CREATE INDEX idx_prenotazioni_data ON prenotazioni(data);
      CREATE INDEX idx_veicoli_utente ON veicoli(utente_id);
      CREATE INDEX idx_disponibilita_giorno ON disponibilita(giorno);
      CREATE INDEX idx_verification_telefono ON verification_codes(telefono);

    `);

        db.exec(`
      CREATE TRIGGER check_disponibilita_before_insert
      BEFORE INSERT ON prenotazioni
      FOR EACH ROW
      BEGIN
          SELECT CASE
              WHEN NOT EXISTS (
                  SELECT 1 FROM disponibilita
                  WHERE giorno = NEW.data
                  AND ora_inizio <= NEW.ora_inizio
                  AND ora_fine >= NEW.ora_fine
              ) THEN RAISE(ABORT, 'Orario non disponibile')
          END;

          SELECT CASE
              WHEN EXISTS (
                  SELECT 1 FROM prenotazioni
                  WHERE data = NEW.data
                  AND ((ora_inizio <= NEW.ora_inizio AND ora_fine > NEW.ora_inizio)
                  OR (ora_inizio < NEW.ora_fine AND ora_fine >= NEW.ora_fine)
                  OR (ora_inizio >= NEW.ora_inizio AND ora_fine <= NEW.ora_fine))
                  AND stato = 'prenotato'
              ) THEN RAISE(ABORT, 'Esiste già una prenotazione in questa fascia oraria')
          END;
      END;
    `);
    }

    return db;
}

let dbInstance: Database.Database | null = null;

//Funzione per ottenere il db comppleto
export function getDb() {
    if (!dbInstance) {
        dbInstance = initDb();
    }
    return dbInstance;
}