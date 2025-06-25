import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

// Definizione delle interfacce per i tipi
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

interface QueryCount {
    count: number;
}

// GET - Ottieni una disponibilità specifica
export async function GET(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    try {
        const id = params.id;
        const db = getDb();
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;

        if (!disponibilita) {
            return NextResponse.json(
                {success: false, error: 'Disponibilità non trovata'},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, data: disponibilita});
    } catch (error) {
        console.error('Errore nel recupero della disponibilità:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero della disponibilità'},
            {status: 500}
        );
    }
}

// PUT - Aggiorna una disponibilità
export async function PUT(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    try {
        // Verifica autenticazione (solo admin)
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        // Verifica che l'utente sia admin
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user || !user.is_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore'},
                {status: 403}
            );
        }

        const id = params.id;
        const {giorno_settimana, ora_inizio, ora_fine} = await request.json();

        // Validazione
        if (giorno_settimana === undefined || !ora_inizio || !ora_fine) {
            return NextResponse.json(
                {success: false, error: 'Dati mancanti'},
                {status: 400}
            );
        }

        // Verifica che giorno_settimana sia tra 0 e 6
        if (giorno_settimana < 0 || giorno_settimana > 6) {
            return NextResponse.json(
                {success: false, error: 'Il giorno della settimana deve essere un numero tra 0 e 6'},
                {status: 400}
            );
        }

        // Verifica che ora_inizio sia minore di ora_fine
        if (ora_inizio >= ora_fine) {
            return NextResponse.json(
                {success: false, error: 'L\'ora di inizio deve essere precedente all\'ora di fine'},
                {status: 400}
            );
        }

        // Verifica esistenza disponibilità
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;
        if (!disponibilita) {
            return NextResponse.json(
                {success: false, error: 'Disponibilità non trovata'},
                {status: 404}
            );
        }

        // Verifica se esiste già un altro orario per questo giorno della settimana
        const esistente = db.prepare('SELECT id FROM disponibilita WHERE giorno_settimana = ? AND id != ?').get(giorno_settimana, id) as Disponibilita;

        if (esistente) {
            return NextResponse.json(
                {success: false, error: 'Esiste già un orario per questo giorno della settimana'},
                {status: 400}
            );
        }

        // Aggiornamento
        db.prepare(
            'UPDATE disponibilita SET giorno_settimana = ?, ora_inizio = ?, ora_fine = ? WHERE id = ?'
        ).run(giorno_settimana, ora_inizio, ora_fine, id);

        return NextResponse.json({
            success: true,
            data: {id: parseInt(id), giorno_settimana, ora_inizio, ora_fine}
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della disponibilità:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'aggiornamento della disponibilità'},
            {status: 500}
        );
    }
}

// DELETE - Elimina una disponibilità
export async function DELETE(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    try {
        // Verifica autenticazione (solo admin)
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        // Verifica che l'utente sia admin
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user || !user.is_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore'},
                {status: 403}
            );
        }

        const id = params.id;

        // Verifica esistenza disponibilità
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;
        if (!disponibilita) {
            return NextResponse.json(
                {success: false, error: 'Disponibilità non trovata'},
                {status: 404}
            );
        }

        // Eliminazione
        db.prepare('DELETE FROM disponibilita WHERE id = ?').run(id);

        return NextResponse.json({success: true, message: 'Disponibilità eliminata con successo'});
    } catch (error) {
        console.error('Errore nell\'eliminazione della disponibilità:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'eliminazione della disponibilità'},
            {status: 500}
        );
    }
}