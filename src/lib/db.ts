import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, {recursive: true});
}

export function initDb() {
    ensureDirectoryExistence(DB_PATH);

    const exists = fs.existsSync(DB_PATH);
    const db = new Database(DB_PATH);

    if (!exists) {
        console.log('Creazione del database...');

        db.exec(`
            CREATE TABLE users
            (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                nome           TEXT              NOT NULL,
                cognome        TEXT              NOT NULL,
                telefono       TEXT              NOT NULL UNIQUE,
                is_admin       BOOLEAN DEFAULT 0 NOT NULL,
                is_super_admin BOOLEAN DEFAULT 0 NOT NULL,
                password       TEXT
            );

            CREATE TABLE veicoli
            (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id        INTEGER NOT NULL,
                tipo           TEXT    NOT NULL,
                marca          TEXT    NOT NULL,
                modello        TEXT    NOT NULL,
                anno           INTEGER,
                targa          TEXT    NOT NULL,
                cilindrata     INTEGER,
                data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                UNIQUE (user_id, targa)
            );

            CREATE TABLE servizi
            (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                nome          TEXT    NOT NULL,
                descrizione   TEXT,
                durata_minuti INTEGER NOT NULL,
                prezzo        REAL    NOT NULL
            );

            CREATE TABLE disponibilita
            (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                giorno_settimana INTEGER NOT NULL CHECK (giorno_settimana BETWEEN 0 AND 6),
                ora_inizio       TIME    NOT NULL,
                ora_fine         TIME    NOT NULL,
                CHECK (ora_inizio < ora_fine),
                UNIQUE (giorno_settimana)
            );

            CREATE TABLE prenotazioni
            (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id           INTEGER NOT NULL,
                veicolo_id        INTEGER NOT NULL,
                servizio_id       INTEGER NOT NULL,
                data_prenotazione DATE    NOT NULL,
                ora_inizio        TIME    NOT NULL,
                ora_fine          TIME    NOT NULL,
                note              TEXT,
                data_creazione    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (veicolo_id) REFERENCES veicoli (id) ON DELETE CASCADE,
                FOREIGN KEY (servizio_id) REFERENCES servizi (id) ON DELETE CASCADE,
                CHECK (ora_inizio < ora_fine)
            );

            CREATE TABLE verification_codes
            (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                telefono   TEXT      NOT NULL,
                code       TEXT      NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                is_used    BOOLEAN   DEFAULT 0
            );

            CREATE INDEX idx_prenotazioni_data ON prenotazioni (data_prenotazione);
            CREATE INDEX idx_prenotazioni_user ON prenotazioni (user_id);
            CREATE INDEX idx_prenotazioni_data_ora ON prenotazioni (data_prenotazione, ora_inizio);
            CREATE INDEX idx_veicoli_user ON veicoli (user_id);
            CREATE INDEX idx_disponibilita_giorno ON disponibilita (giorno_settimana);
            CREATE INDEX idx_verification_telefono ON verification_codes (telefono);

            INSERT INTO users (nome, cognome, telefono, is_admin, is_super_admin, password)
            VALUES ('Admin', 'Admin', 'admin', 1, 1, '$2b$10$2Z5sVH.joMAIhTJjb0Oeg.AXYs6NrFnjQIcz7DG.H0DShyMQkuRRq');
        `);

        db.exec(`
                          CREATE TRIGGER check_disponibilita_before_insert
                          BEFORE INSERT ON prenotazioni
                          FOR EACH ROW
                          BEGIN
                              SELECT CASE
                                  WHEN NOT EXISTS (
                                      SELECT 1 FROM disponibilita
                                      WHERE giorno_settimana = strftime('%w', NEW.data_prenotazione)
                                      AND ora_inizio <= NEW.ora_inizio
                                      AND ora_fine >= NEW.ora_fine
                                  ) THEN RAISE(ABORT, 'Orario non disponibile')
                              END;
                
                              SELECT CASE
                                  WHEN EXISTS (
                                      SELECT 1 FROM prenotazioni
                                      WHERE data_prenotazione = NEW.data_prenotazione
                                      AND ((ora_inizio <= NEW.ora_inizio AND ora_fine > NEW.ora_inizio)
                                      OR (ora_inizio < NEW.ora_fine AND ora_fine >= NEW.ora_fine)
                                      OR (ora_inizio >= NEW.ora_inizio AND ora_fine <= NEW.ora_fine))
                                  ) THEN RAISE(ABORT, 'Esiste già una prenotazione in questa fascia oraria')
                              END;
                              
                              SELECT CASE
                                  WHEN NOT EXISTS (
                                      SELECT 1 FROM veicoli
                                      WHERE id = NEW.veicolo_id
                                      AND user_id = NEW.user_id
                                  ) THEN RAISE(ABORT, 'Il veicolo non appartiene all''utente')
                              END;
                          END;
                        `);

        db.exec(`
            CREATE TABLE immagini_auto
            (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                marca   TEXT NOT NULL,
                modello TEXT NOT NULL,
                anno    INTEGER,
                base64  TEXT NOT NULL,
                UNIQUE (marca, modello, anno)
            );
        `);
    }

    return db;
}

let dbInstance: Database.Database | null = null;

export function getDb() {
    if (!dbInstance) {
        dbInstance = initDb();
    }
    return dbInstance;
}

