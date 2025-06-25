import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    id: number;
    is_admin: boolean;
}

interface Disponibilita {
    id: number;
    giorno_settimana: number;
    ora_inizio: string;
    ora_fine: string;
}

interface QueryResult {
    lastInsertRowid: number;
}

// GET - Ottieni tutte le disponibilità
export async function GET() {
    try {
        const db = getDb();
        const disponibilita = db.prepare('SELECT * FROM disponibilita ORDER BY giorno_settimana, ora_inizio').all() as Disponibilita[];
        console.log(disponibilita);
        return NextResponse.json({success: true, data: disponibilita});
    } catch (error) {
        console.error('Errore nel recupero delle disponibilità:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero delle disponibilità'},
            {status: 500}
        );
    }
}

// POST - Crea o aggiorna una disponibilità
export async function POST(request: NextRequest) {
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
        if (!user || !user.is_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore'},
                {status: 403}
            );
        }

        const {giorno_settimana, ora_inizio, ora_fine} = await request.json();

        if (giorno_settimana === undefined || !ora_inizio || !ora_fine) {
            return NextResponse.json(
                {success: false, error: 'Dati mancanti'},
                {status: 400}
            );
        }

        if (giorno_settimana < 0 || giorno_settimana > 6) {
            return NextResponse.json(
                {success: false, error: 'Il giorno della settimana deve essere un numero tra 0 e 6'},
                {status: 400}
            );
        }

        if (ora_inizio >= ora_fine) {
            return NextResponse.json(
                {success: false, error: 'L\'ora di inizio deve essere precedente all\'ora di fine'},
                {status: 400}
            );
        }

        const esistente = db.prepare('SELECT id FROM disponibilita WHERE giorno_settimana = ?').get(giorno_settimana) as Disponibilita;

        if (esistente) {
            db.prepare(
                'UPDATE disponibilita SET ora_inizio = ?, ora_fine = ? WHERE giorno_settimana = ?'
            ).run(ora_inizio, ora_fine, giorno_settimana);

            return NextResponse.json({
                success: true,
                data: {id: esistente.id, giorno_settimana, ora_inizio, ora_fine}
            });
        } else {
            const result = db.prepare(
                'INSERT INTO disponibilita (giorno_settimana, ora_inizio, ora_fine) VALUES (?, ?, ?)'
            ).run(giorno_settimana, ora_inizio, ora_fine) as QueryResult;

            return NextResponse.json({
                success: true,
                data: {id: result.lastInsertRowid, giorno_settimana, ora_inizio, ora_fine}
            }, {status: 201});
        }
    } catch (error) {
        console.error('Errore nella creazione della disponibilità:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nella creazione della disponibilità'},
            {status: 500}
        );
    }
}