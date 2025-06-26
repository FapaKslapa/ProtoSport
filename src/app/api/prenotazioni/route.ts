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

interface Disponibilita {
    ora_inizio: string;
    ora_fine: string;
}

interface QueryResult {
    lastInsertRowid: number;
}

interface Slot {
    inizio: string;
    fine: string;
    disponibile: boolean;
    durata: number; // Durata in minuti
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

function calcolaSlotDisponibili(data: string, disponibilita: Disponibilita, prenotazioni: Prenotazione[], servizi?: {
    [id: number]: Servizio
}): Slot[] {
    const slots: Slot[] = [];
    const DURATA_DEFAULT_SLOT = 30;

    const aperturaMinuti = convertiInMinuti(disponibilita.ora_inizio);
    const chiusuraMinuti = convertiInMinuti(disponibilita.ora_fine);

    const prenotazioniOrdinate = [...prenotazioni].sort((a, b) =>
        convertiInMinuti(a.ora_inizio) - convertiInMinuti(b.ora_inizio)
    );

    const intervalli = prenotazioniOrdinate.map(p => ({
        inizio: convertiInMinuti(p.ora_inizio),
        fine: convertiInMinuti(p.ora_fine),
        disponibile: false,
        durata: convertiInMinuti(p.ora_fine) - convertiInMinuti(p.ora_inizio)
    }));

    let orarioCorrente = aperturaMinuti;

    const creaSlotStandard = (inizio: number, fine: number) => {
        let orarioSlot = inizio;
        while (orarioSlot + DURATA_DEFAULT_SLOT <= fine) {
            slots.push({
                inizio: convertiInOrario(orarioSlot),
                fine: convertiInOrario(orarioSlot + DURATA_DEFAULT_SLOT),
                disponibile: true,
                durata: DURATA_DEFAULT_SLOT
            });
            orarioSlot += DURATA_DEFAULT_SLOT;
        }
        if (fine - orarioSlot >= 15) {
            slots.push({
                inizio: convertiInOrario(orarioSlot),
                fine: convertiInOrario(fine),
                disponibile: true,
                durata: fine - orarioSlot
            });
        }
    };

    for (const intervallo of intervalli) {
        if (orarioCorrente < intervallo.inizio) {
            creaSlotStandard(orarioCorrente, intervallo.inizio);
        }

        slots.push({
            inizio: convertiInOrario(intervallo.inizio),
            fine: convertiInOrario(intervallo.fine),
            disponibile: false,
            durata: intervallo.durata
        });

        orarioCorrente = intervallo.fine;
    }

    if (orarioCorrente < chiusuraMinuti) {
        creaSlotStandard(orarioCorrente, chiusuraMinuti);
    }

    return slots;
}

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
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;

        const searchParams = request.nextUrl.searchParams;
        const data = searchParams.get('data');
        const servizioId = searchParams.get('servizio_id');

        if (data) {
            const dataPrenotazione = new Date(data);
            const giornoSettimana = dataPrenotazione.getDay();

            const disponibilita = db.prepare('SELECT ora_inizio, ora_fine FROM disponibilita WHERE giorno_settimana = ?')
                .get(giornoSettimana) as Disponibilita;

            if (!disponibilita) {
                return NextResponse.json({
                    success: false,
                    error: 'L\'officina è chiusa in questo giorno'
                }, {status: 400});
            }

            const prenotazioni = db.prepare(`
                SELECT p.id, p.ora_inizio, p.ora_fine, p.servizio_id
                FROM prenotazioni p
                WHERE p.data_prenotazione = ?
                ORDER BY p.ora_inizio
            `).all(data) as Prenotazione[];

            const servizi = db.prepare(`SELECT id, durata_minuti
                                        FROM servizi`).all() as Servizio[];
            const serviziMap = servizi.reduce((acc, servizio) => {
                acc[servizio.id] = servizio;
                return acc;
            }, {} as { [id: number]: Servizio });

            const slots = calcolaSlotDisponibili(data, disponibilita, prenotazioni, serviziMap);

            if (servizioId) {
                const servizio = db.prepare('SELECT durata_minuti FROM servizi WHERE id = ?').get(servizioId) as Servizio | undefined;
                if (servizio && typeof servizio.durata_minuti === 'number') {
                    const durataNecessaria = servizio.durata_minuti;

                    const slotsCompatibili = slots.filter(slot =>
                        slot.disponibile && slot.durata >= durataNecessaria
                    );

                    return NextResponse.json({success: true, data: slotsCompatibili});
                }
            }

            return NextResponse.json({success: true, data: slots});
        } else {
            let prenotazioni: Prenotazione[];
            if (user?.is_admin) {
                prenotazioni = db.prepare(`
                    SELECT p.*,
                           u.nome    as user_nome,
                           u.cognome as user_cognome,
                           s.nome    as servizio_nome,
                           v.marca,
                           v.modello,
                           v.targa
                    FROM prenotazioni p
                             JOIN users u ON p.user_id = u.id
                             JOIN servizi s ON p.servizio_id = s.id
                             JOIN veicoli v ON p.veicolo_id = v.id
                    ORDER BY p.data_prenotazione DESC, p.ora_inizio ASC
                `).all() as Prenotazione[];
            } else {
                prenotazioni = db.prepare(`
                    SELECT p.*,
                           s.nome as servizio_nome,
                           v.marca,
                           v.modello,
                           v.targa
                    FROM prenotazioni p
                             JOIN servizi s ON p.servizio_id = s.id
                             JOIN veicoli v ON p.veicolo_id = v.id
                    WHERE p.user_id = ?
                    ORDER BY p.data_prenotazione DESC, p.ora_inizio ASC
                `).all(userId) as Prenotazione[];
            }

            return NextResponse.json({success: true, data: prenotazioni});
        }
    } catch (error) {
        console.error('Errore nel recupero delle prenotazioni:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero delle prenotazioni'},
            {status: 500}
        );
    }
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

        const veicolo = db.prepare('SELECT id FROM veicoli WHERE id = ? AND user_id = ?').get(veicolo_id, userId);
        if (!veicolo) {
            return NextResponse.json(
                {success: false, error: 'Veicolo non trovato o non appartiene all\'utente'},
                {status: 404}
            );
        }

        const servizio = db.prepare('SELECT id, durata_minuti FROM servizi WHERE id = ?').get(servizio_id) as Servizio | undefined;
        if (!servizio) {
            return NextResponse.json(
                {success: false, error: 'Servizio non trovato'},
                {status: 404}
            );
        }

        const inizioMinuti = convertiInMinuti(ora_inizio);
        const fineMinuti = inizioMinuti + servizio.durata_minuti;
        const ora_fine = convertiInOrario(fineMinuti);

        const dataPrenotazione = new Date(data_prenotazione);
        const giornoSettimana = dataPrenotazione.getDay();

        const disponibilita = db.prepare('SELECT ora_inizio, ora_fine FROM disponibilita WHERE giorno_settimana = ?')
            .get(giornoSettimana) as Disponibilita;

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

        const prenotazioniConflitto = db.prepare(`
            SELECT id
            FROM prenotazioni
            WHERE data_prenotazione = ?
              AND ((ora_inizio <= ? AND ora_fine > ?) OR (ora_inizio < ? AND ora_fine >= ?) OR
                   (ora_inizio >= ? AND ora_fine <= ?))
        `).all(data_prenotazione, ora_inizio, ora_inizio, ora_fine, ora_fine, ora_inizio, ora_fine);

        if (prenotazioniConflitto && prenotazioniConflitto.length > 0) {
            return NextResponse.json(
                {success: false, error: 'L\'orario richiesto non è disponibile'},
                {status: 400}
            );
        }

        const result = db.prepare(`
            INSERT INTO prenotazioni (user_id, servizio_id, veicolo_id, data_prenotazione, ora_inizio, ora_fine,
                                      note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, servizio_id, veicolo_id, data_prenotazione, ora_inizio, ora_fine, note || null) as QueryResult;

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