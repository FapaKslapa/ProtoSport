import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

// Definizione delle interfacce
interface User {
    id: number;
    is_admin: boolean;
}

interface Prenotazione {
    id: number;
    user_id: number;
    servizio_id: number;
    veicolo_id: number;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    note?: string;
}

interface Servizio {
    id: number;
    durata_minuti: number;
}

const convertiInMinuti = (ora: string): number => {
    const [ore, minuti] = ora.split(':').map(Number);
    return ore * 60 + minuti;
};

const convertiInOrario = (minuti: number): string => {
    const ore = Math.floor(minuti / 60);
    const min = minuti % 60;
    return `${ore.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

// GET - Ottieni una prenotazione specifica
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();

        // Verifica autenticazione
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;

        let prenotazione;
        if (user?.is_admin) {
            // Admin può vedere qualsiasi prenotazione
            prenotazione = db.prepare(`
                SELECT p.*,
                       u.nome    as user_nome,
                       u.cognome as user_cognome,
                       s.nome    as servizio_nome,
                       s.prezzo,
                       s.durata_minuti,
                       v.marca,
                       v.modello,
                       v.targa
                FROM prenotazioni p
                         JOIN users u ON p.user_id = u.id
                         JOIN servizi s ON p.servizio_id = s.id
                         JOIN veicoli v ON p.veicolo_id = v.id
                WHERE p.id = ?
            `).get(id);
        } else {
            // Utente normale vede solo le proprie prenotazioni
            prenotazione = db.prepare(`
                SELECT p.*,
                       s.nome as servizio_nome,
                       s.prezzo,
                       s.durata_minuti,
                       v.marca,
                       v.modello,
                       v.targa
                FROM prenotazioni p
                         JOIN servizi s ON p.servizio_id = s.id
                         JOIN veicoli v ON p.veicolo_id = v.id
                WHERE p.id = ?
                  AND p.user_id = ?
            `).get(id, userId);
        }

        if (!prenotazione) {
            return NextResponse.json(
                {success: false, error: 'Prenotazione non trovata'},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, data: prenotazione});
    } catch (error) {
        console.error('Errore nel recupero della prenotazione:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero della prenotazione'},
            {status: 500}
        );
    }
}

// PUT - Aggiorna una prenotazione
export async function PUT(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();

        // Verifica autenticazione
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;

        // Recupera la prenotazione esistente
        const prenotazione = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id) as Prenotazione;

        if (!prenotazione) {
            return NextResponse.json(
                {success: false, error: 'Prenotazione non trovata'},
                {status: 404}
            );
        }

        // Verifica che l'utente sia autorizzato (proprietario o admin)
        if (prenotazione.user_id !== userId && !user?.is_admin) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato a modificare questa prenotazione'},
                {status: 403}
            );
        }

        const updateData = await request.json();
        const {servizio_id, veicolo_id, data_prenotazione, ora_inizio, stato, note} = updateData;

        // Limitazioni diverse per admin e utenti normali
        if (!user?.is_admin) {
            // Gli utenti normali possono solo annullare le prenotazioni, non modificarle
            if (updateData.stato && updateData.stato !== 'cancelled') {
                return NextResponse.json(
                    {success: false, error: 'Gli utenti possono solo annullare le prenotazioni'},
                    {status: 403}
                );
            }

            // Se la prenotazione è già confermata o completata, non può essere annullata
            if (prenotazione.stato === 'completed') {
                return NextResponse.json(
                    {success: false, error: 'Non è possibile annullare una prenotazione completata'},
                    {status: 400}
                );
            }

            // Aggiorna solo lo stato e le note
            db.prepare('UPDATE prenotazioni SET stato = ?, note = ? WHERE id = ?').run(
                'cancelled',
                updateData.note || prenotazione.note,
                id
            );
        } else {
            // Admin può aggiornare tutti i campi
            // Se viene aggiornato il servizio, ricalcola l'ora di fine
            let ora_fine = prenotazione.ora_fine;

            if (servizio_id !== undefined && (ora_inizio || prenotazione.ora_inizio)) {
                const servizio = db.prepare('SELECT durata_minuti FROM servizi WHERE id = ?').get(servizio_id) as Servizio;
                if (servizio) {
                    const inizioMinuti = convertiInMinuti(ora_inizio || prenotazione.ora_inizio);
                    const fineMinuti = inizioMinuti + servizio.durata_minuti;
                    ora_fine = convertiInOrario(fineMinuti);

                    // Verifica conflitti con la nuova durata
                    const dataPrenotazioneCheck = data_prenotazione || prenotazione.data_prenotazione;
                    const oraInizioCheck = ora_inizio || prenotazione.ora_inizio;

                    const prenotazioniConflitto = db.prepare(`
                        SELECT id
                        FROM prenotazioni
                        WHERE data_prenotazione = ?
                          AND id != ?
                          AND ((ora_inizio <= ? AND ora_fine > ?) OR (ora_inizio < ? AND ora_fine >= ?) OR
                               (ora_inizio >= ? AND ora_fine <= ?))
                          AND stato IN ('pending', 'confirmed')
                    `).all(dataPrenotazioneCheck, id, oraInizioCheck, oraInizioCheck, ora_fine, ora_fine, oraInizioCheck, ora_fine);

                    if (prenotazioniConflitto && prenotazioniConflitto.length > 0) {
                        return NextResponse.json(
                            {success: false, error: 'La modifica crea un conflitto con altre prenotazioni'},
                            {status: 400}
                        );
                    }
                }
            }

            // Costruisci la query dinamicamente in base ai campi forniti
            let updateFields = [];
            let updateValues = [];

            if (servizio_id !== undefined) {
                updateFields.push('servizio_id = ?');
                updateValues.push(servizio_id);
            }

            if (veicolo_id !== undefined) {
                updateFields.push('veicolo_id = ?');
                updateValues.push(veicolo_id);
            }

            if (data_prenotazione !== undefined) {
                updateFields.push('data_prenotazione = ?');
                updateValues.push(data_prenotazione);
            }

            if (ora_inizio !== undefined) {
                updateFields.push('ora_inizio = ?');
                updateValues.push(ora_inizio);
            }

            if (ora_fine !== prenotazione.ora_fine) {
                updateFields.push('ora_fine = ?');
                updateValues.push(ora_fine);
            }

            if (stato !== undefined) {
                updateFields.push('stato = ?');
                updateValues.push(stato);
            }

            if (note !== undefined) {
                updateFields.push('note = ?');
                updateValues.push(note);
            }

            if (updateFields.length > 0) {
                const query = `UPDATE prenotazioni
                               SET ${updateFields.join(', ')}
                               WHERE id = ?`;
                updateValues.push(id);
                db.prepare(query).run(...updateValues);
            }
        }

        // Recupera la prenotazione aggiornata
        const prenotazioneAggiornata = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id);

        return NextResponse.json({success: true, data: prenotazioneAggiornata});
    } catch (error) {
        console.error('Errore nell\'aggiornamento della prenotazione:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'aggiornamento della prenotazione'},
            {status: 500}
        );
    }
}

// DELETE - Elimina una prenotazione
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();

        // Verifica autenticazione
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;

        // Recupera la prenotazione esistente
        const prenotazione = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id);

        if (!prenotazione) {
            return NextResponse.json(
                {success: false, error: 'Prenotazione non trovata'},
                {status: 404}
            );
        }

        // Solo gli admin possono eliminare le prenotazioni
        if (!user?.is_admin) {
            return NextResponse.json(
                {success: false, error: 'Solo gli amministratori possono eliminare le prenotazioni'},
                {status: 403}
            );
        }

        // Elimina la prenotazione
        db.prepare('DELETE FROM prenotazioni WHERE id = ?').run(id);

        return NextResponse.json({success: true, message: 'Prenotazione eliminata con successo'});
    } catch (error) {
        console.error('Errore nell\'eliminazione della prenotazione:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'eliminazione della prenotazione'},
            {status: 500}
        );
    }
}