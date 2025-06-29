import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    id: number;
    is_admin: boolean;
    is_super_admin: boolean;
}

interface Servizio {
    id: number;
    nome: string;
    descrizione: string | null;
    durata_minuti: number;
    prezzo: number;
}

interface QueryCount {
    count: number;
}

function getIdFromRequest(request: NextRequest): string {
    return request.nextUrl.pathname.split('/').pop() as string;
}

export async function GET(request: NextRequest) {
    try {
        const id = getIdFromRequest(request);
        const db = getDb();
        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;

        if (!servizio) {
            return NextResponse.json(
                {success: false, error: 'Servizio non trovato'},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, data: servizio});
    } catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero del servizio'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        const user = db.prepare('SELECT is_admin, is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin && !user?.is_super_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore o super amministratore'},
                {status: 403}
            );
        }

        const id = getIdFromRequest(request);
        const {nome, descrizione, durata_minuti, prezzo} = await request.json();

        if (!nome || !durata_minuti || prezzo === undefined) {
            return NextResponse.json(
                {success: false, error: 'Dati mancanti'},
                {status: 400}
            );
        }

        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;
        if (!servizio) {
            return NextResponse.json(
                {success: false, error: 'Servizio non trovato'},
                {status: 404}
            );
        }

        db.prepare(
            'UPDATE servizi SET nome = ?, descrizione = ?, durata_minuti = ?, prezzo = ? WHERE id = ?'
        ).run(nome, descrizione ?? null, durata_minuti, prezzo, id);

        return NextResponse.json({
            success: true,
            data: {id: parseInt(id), nome, descrizione, durata_minuti, prezzo}
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del servizio:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'aggiornamento del servizio'},
            {status: 500}
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();
        const user = db.prepare('SELECT is_admin, is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin && !user?.is_super_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore o super amministratore'},
                {status: 403}
            );
        }

        const id = getIdFromRequest(request);
        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;
        if (!servizio) {
            return NextResponse.json(
                {success: false, error: 'Servizio non trovato'},
                {status: 404}
            );
        }

        const prenotazioni = db.prepare('SELECT COUNT(*) as count FROM prenotazioni WHERE servizio_id = ?').get(id) as QueryCount;
        if (prenotazioni?.count > 0) {
            return NextResponse.json(
                {success: false, error: 'Impossibile eliminare il servizio: esistono prenotazioni associate'},
                {status: 400}
            );
        }

        db.prepare('DELETE FROM servizi WHERE id = ?').run(id);

        return NextResponse.json({success: true, message: 'Servizio eliminato con successo'});
    } catch (error) {
        console.error('Errore nell\'eliminazione del servizio:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nell\'eliminazione del servizio'},
            {status: 500}
        );
    }
}