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

interface QueryResult {
    lastInsertRowid: number;
}

export async function GET() {
    try {
        const db = getDb();
        const servizi = db.prepare('SELECT * FROM servizi').all() as Servizio[];
        return NextResponse.json({success: true, data: servizi});
    } catch (error) {
        console.error('Errore nel recupero dei servizi:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel recupero dei servizi'},
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

        const db = getDb();
        const user = db.prepare('SELECT is_admin, is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin && !user?.is_super_admin) {
            return NextResponse.json(
                {success: false, error: 'Accesso negato: richiesti privilegi di amministratore o super amministratore'},
                {status: 403}
            );
        }

        const {nome, descrizione, durata_minuti, prezzo} = await request.json();

        if (!nome || durata_minuti === undefined || prezzo === undefined) {
            return NextResponse.json(
                {success: false, error: 'Dati mancanti'},
                {status: 400}
            );
        }

        const result = db.prepare(
            'INSERT INTO servizi (nome, descrizione, durata_minuti, prezzo) VALUES (?, ?, ?, ?)'
        ).run(nome, descrizione ?? null, durata_minuti, prezzo) as QueryResult;

        return NextResponse.json({
            success: true,
            data: {id: result.lastInsertRowid, nome, descrizione, durata_minuti, prezzo}
        }, {status: 201});
    } catch (error) {
        console.error('Errore nella creazione del servizio:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nella creazione del servizio'},
            {status: 500}
        );
    }
}