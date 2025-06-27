import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

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
    note?: string;
}

interface Servizio {
    id: number;
    durata_minuti: number;
}

const toMin = (ora: string) => {
    const [h, m] = ora.split(':').map(Number);
    return h * 60 + m;
};
const toOra = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        let prenotazione;
        if (user?.is_admin) {
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
            prenotazione = db.prepare(`
                SELECT p.*, s.nome as servizio_nome, s.prezzo, s.durata_minuti, v.marca, v.modello, v.targa
                FROM prenotazioni p
                         JOIN servizi s ON p.servizio_id = s.id
                         JOIN veicoli v ON p.veicolo_id = v.id
                WHERE p.id = ?
                  AND p.user_id = ?
            `).get(id, userId);
        }
        if (!prenotazione) return NextResponse.json({success: false, error: 'Prenotazione non trovata'}, {status: 404});
        return NextResponse.json({success: true, data: prenotazione});
    } catch {
        return NextResponse.json({success: false, error: 'Errore nel recupero della prenotazione'}, {status: 500});
    }
}

export async function PUT(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        const prenotazione = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id) as Prenotazione;
        if (!prenotazione) return NextResponse.json({success: false, error: 'Prenotazione non trovata'}, {status: 404});
        if (prenotazione.user_id !== userId && !user?.is_admin)
            return NextResponse.json({
                success: false,
                error: 'Non autorizzato a modificare questa prenotazione'
            }, {status: 403});
        const updateData = await request.json();
        const {servizio_id, veicolo_id, data_prenotazione, ora_inizio, note} = updateData;

        if (!user?.is_admin) {
            // Gli utenti non possono modificare la prenotazione (solo admin)
            return NextResponse.json({
                success: false,
                error: 'Solo gli amministratori possono modificare le prenotazioni'
            }, {status: 403});
        } else {
            let ora_fine = prenotazione.ora_fine;
            let nuovoServizioId = servizio_id ?? prenotazione.servizio_id;
            let nuovoOraInizio = ora_inizio ?? prenotazione.ora_inizio;
            if (servizio_id !== undefined || ora_inizio !== undefined) {
                const servizio = db.prepare('SELECT durata_minuti FROM servizi WHERE id = ?').get(nuovoServizioId) as Servizio;
                if (servizio) {
                    const inizioMin = toMin(nuovoOraInizio);
                    ora_fine = toOra(inizioMin + servizio.durata_minuti);
                    const dataCheck = data_prenotazione ?? prenotazione.data_prenotazione;
                    const prenotazioniConflitto = db.prepare(`
                                        SELECT id FROM prenotazioni
                                        WHERE data_prenotazione = ? AND id != ?
                                        AND ((ora_inizio < ? AND ora_fine > ?) OR (ora_inizio < ? AND ora_fine > ?) OR (ora_inizio >= ? AND ora_fine <= ?))
                                    `).all(dataCheck, id, ora_fine, nuovoOraInizio, nuovoOraInizio, ora_fine, nuovoOraInizio, ora_fine);
                    if (prenotazioniConflitto.length > 0)
                        return NextResponse.json({
                            success: false,
                            error: 'La modifica crea un conflitto con altre prenotazioni'
                        }, {status: 400});
                }
            }
            let updateFields = [], updateValues = [];
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
            if (note !== undefined) {
                updateFields.push('note = ?');
                updateValues.push(note);
            }
            if (updateFields.length > 0) {
                const query = `UPDATE prenotazioni SET ${updateFields.join(', ')} WHERE id = ?`;
                updateValues.push(id);
                db.prepare(query).run(...updateValues);
            }
        }
        const prenotazioneAggiornata = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id);
        return NextResponse.json({success: true, data: prenotazioneAggiornata});
    } catch {
        return NextResponse.json({
            success: false,
            error: 'Errore nell\'aggiornamento della prenotazione'
        }, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        const prenotazione = db.prepare('SELECT * FROM prenotazioni WHERE id = ?').get(id);
        if (!prenotazione) return NextResponse.json({success: false, error: 'Prenotazione non trovata'}, {status: 404});
        if (!user?.is_admin)
            return NextResponse.json({
                success: false,
                error: 'Solo gli amministratori possono eliminare le prenotazioni'
            }, {status: 403});
        db.prepare('DELETE FROM prenotazioni WHERE id = ?').run(id);
        return NextResponse.json({success: true, message: 'Prenotazione eliminata con successo'});
    } catch {
        return NextResponse.json({
            success: false,
            error: 'Errore nell\'eliminazione della prenotazione'
        }, {status: 500});
    }
}