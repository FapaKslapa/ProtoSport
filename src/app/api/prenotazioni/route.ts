import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface Servizio {
    id: number;
    durata_minuti: number;
}

interface Disponibilita {
    ora_inizio: string;
    ora_fine: string;
}

export async function POST(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const requestData = await request.json();
        const {
            servizio_id,
            veicolo_id,
            data_prenotazione,
            ora_inizio,
            note
        } = requestData;

        if (!servizio_id || !veicolo_id || !data_prenotazione || !ora_inizio) {
            return NextResponse.json(
                {success: false, error: 'Dati mancanti'},
                {status: 400}
            );
        }

        const db = getDb();

        // Verifica che il veicolo appartenga all'utente
        const veicolo = db.prepare('SELECT id FROM veicoli WHERE id = ? AND user_id = ?').get(veicolo_id, userId) as {
            id: number
        } | undefined;
        if (!veicolo) {
            return NextResponse.json(
                {success: false, error: 'Veicolo non trovato o non appartiene all\'utente'},
                {status: 404}
            );
        }

        // Recupera il servizio
        const servizio = db.prepare('SELECT id, durata_minuti FROM servizi WHERE id = ?').get(servizio_id) as Servizio | undefined;
        if (!servizio) {
            return NextResponse.json(
                {success: false, error: 'Servizio non trovato'},
                {status: 404}
            );
        }

        // Calcola ora_fine
        const convertiInMinuti = (ora: string): number => {
            const [ore, minuti] = ora.split(':').map(Number);
            return ore * 60 + minuti;
        };
        const convertiInOrario = (minuti: number): string => {
            const ore = Math.floor(minuti / 60);
            const min = minuti % 60;
            return `${ore.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        };

        const inizioMinuti = convertiInMinuti(ora_inizio);
        const fineMinuti = inizioMinuti + servizio.durata_minuti;
        const ora_fine = convertiInOrario(fineMinuti);

        // Giorno della settimana (0=dom, 1=lun, ...)
        const dataPrenotazione = new Date(data_prenotazione);
        const giornoSettimana = dataPrenotazione.getDay();

        // Recupera disponibilità
        const disponibilita = db.prepare('SELECT ora_inizio, ora_fine FROM disponibilita WHERE giorno_settimana = ?')
            .get(giornoSettimana) as Disponibilita | undefined;

        if (!disponibilita) {
            return NextResponse.json(
                {success: false, error: 'L\'officina è chiusa in questo giorno'},
                {status: 400}
            );
        }

        if (ora_inizio < disponibilita.ora_inizio || ora_fine > disponibilita.ora_fine) {
            return NextResponse.json(
                {success: false, error: 'L\'orario richiesto è fuori dagli orari di apertura'},
                {status: 400}
            );
        }

        // Controllo conflitti
        const prenotazioniConflitto = db.prepare(`
            SELECT id
            FROM prenotazioni
            WHERE data_prenotazione = ?
              AND ((ora_inizio <= ? AND ora_fine > ?) OR (ora_inizio < ? AND ora_fine >= ?) OR
                   (ora_inizio >= ? AND ora_fine <= ?))
        `).all(
            data_prenotazione,
            ora_inizio, ora_inizio,
            ora_fine, ora_fine,
            ora_inizio, ora_fine
        ) as { id: number }[];

        if (prenotazioniConflitto && prenotazioniConflitto.length > 0) {
            return NextResponse.json(
                {success: false, error: 'L\'orario richiesto non è disponibile'},
                {status: 400}
            );
        }

        // Inserisci la prenotazione
        const result = db.prepare(`
            INSERT INTO prenotazioni (user_id, servizio_id, veicolo_id, data_prenotazione, ora_inizio, ora_fine, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, servizio_id, veicolo_id, data_prenotazione, ora_inizio, ora_fine, note || null);

        return NextResponse.json({
            success: true,
            data: {
                id: result.lastInsertRowid,
                user_id: userId,
                servizio_id,
                veicolo_id,
                data_prenotazione,
                ora_inizio,
                ora_fine,
                note: note || null
            }
        }, {status: 201});
    } catch (error) {
        console.error('Errore nella creazione della prenotazione:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nella creazione della prenotazione'},
            {status: 500}
        );
    }
}

// GET - Recupera tutte le prenotazioni dell'utente autenticato
export async function GET(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        // Recupera le prenotazioni dell'utente con info veicolo e servizio
        const prenotazioni = db.prepare(`
            SELECT p.*, s.nome as servizio_nome, s.prezzo, s.durata_minuti, v.marca, v.modello, v.targa
            FROM prenotazioni p
                     JOIN servizi s ON p.servizio_id = s.id
                     JOIN veicoli v ON p.veicolo_id = v.id
            WHERE p.user_id = ?
            ORDER BY p.data_prenotazione DESC, p.ora_inizio DESC
        `).all(userId);

        return NextResponse.json({success: true, data: prenotazioni});
    } catch (error) {
        console.error('Errore nel recupero delle prenotazioni:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero delle prenotazioni'},
            {status: 500}
        );
    }
}