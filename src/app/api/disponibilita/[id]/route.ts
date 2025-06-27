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

const getId = (req: NextRequest) => req.nextUrl.pathname.split('/').pop();

export async function GET(request: NextRequest) {
    try {
        const id = getId(request);
        const db = getDb();
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;
        if (!disponibilita)
            return NextResponse.json({success: false, error: 'Disponibilità non trovata'}, {status: 404});
        return NextResponse.json({success: true, data: disponibilita});
    } catch {
        return NextResponse.json({success: false, error: 'Errore nel recupero della disponibilità'}, {status: 500});
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId)
            return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin)
            return NextResponse.json({
                success: false,
                error: 'Accesso negato: richiesti privilegi di amministratore'
            }, {status: 403});
        const id = getId(request);
        const {giorno_settimana, ora_inizio, ora_fine} = await request.json();
        if (giorno_settimana === undefined || ora_inizio == null || ora_fine == null)
            return NextResponse.json({
                success: false,
                error: 'Dati mancanti: giorno_settimana, ora_inizio e ora_fine sono obbligatori.'
            }, {status: 400});
        if (giorno_settimana < 0 || giorno_settimana > 6)
            return NextResponse.json({
                success: false,
                error: 'Il giorno della settimana deve essere un numero tra 0 e 6'
            }, {status: 400});
        if (ora_inizio >= ora_fine)
            return NextResponse.json({
                success: false,
                error: "L'ora di inizio deve essere precedente all'ora di fine"
            }, {status: 400});
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;
        if (!disponibilita)
            return NextResponse.json({success: false, error: 'Disponibilità non trovata'}, {status: 404});
        const esistente = db.prepare('SELECT id FROM disponibilita WHERE giorno_settimana = ? AND id != ?').get(giorno_settimana, id) as Disponibilita;
        if (esistente)
            return NextResponse.json({
                success: false,
                error: 'Esiste già un orario per questo giorno della settimana'
            }, {status: 400});
        const prenotazioniFuoriOrario = db.prepare(
            `SELECT id
             FROM prenotazioni
             WHERE strftime('%w', data_prenotazione) = ?
               AND (ora_inizio < ? OR ora_fine > ?) LIMIT 1`
        ).get(giorno_settimana.toString(), ora_inizio, ora_fine);
        if (prenotazioniFuoriOrario)
            return NextResponse.json({
                success: false,
                error: "Non puoi modificare l'orario: esistono prenotazioni che non rientrano nel nuovo intervallo di apertura."
            }, {status: 400});
        db.prepare('UPDATE disponibilita SET giorno_settimana = ?, ora_inizio = ?, ora_fine = ? WHERE id = ?')
            .run(giorno_settimana, ora_inizio, ora_fine, id);
        return NextResponse.json({
            success: true,
            data: {id: parseInt(id as string), giorno_settimana, ora_inizio, ora_fine}
        });
    } catch {
        return NextResponse.json({
            success: false,
            error: "Errore nell'aggiornamento della disponibilità"
        }, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId)
            return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin)
            return NextResponse.json({
                success: false,
                error: 'Accesso negato: richiesti privilegi di amministratore'
            }, {status: 403});
        const id = getId(request);
        const disponibilita = db.prepare('SELECT * FROM disponibilita WHERE id = ?').get(id) as Disponibilita;
        if (!disponibilita)
            return NextResponse.json({success: false, error: 'Disponibilità non trovata'}, {status: 404});
        const prenotazioneEsistente = db.prepare(
            `SELECT 1
             FROM prenotazioni
             WHERE strftime('%w', data_prenotazione) = ? LIMIT 1`
        ).get(disponibilita.giorno_settimana.toString());
        if (prenotazioneEsistente)
            return NextResponse.json({
                success: false,
                error: 'Non puoi chiudere il giorno: esistono già prenotazioni per questo giorno della settimana.'
            }, {status: 400});
        db.prepare('DELETE FROM disponibilita WHERE id = ?').run(id);
        return NextResponse.json({success: true, message: 'Disponibilità eliminata con successo'});
    } catch {
        return NextResponse.json({
            success: false,
            error: "Errore nell'eliminazione della disponibilità"
        }, {status: 500});
    }
}