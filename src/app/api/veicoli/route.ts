import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface Veicolo {
    id: number;
    tipo: string;
    marca: string;
    modello: string;
    anno: number | null;
    targa: string;
    cilindrata: number | null;
    data_creazione: string;
}

interface QueryResult {
    lastInsertRowid: number;
}

export async function POST(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }

        const {marca, modello, anno, tipo, cilindrata, targa} = await request.json();
        if (!marca || !modello || !tipo || !targa) {
            return NextResponse.json({success: false, message: 'Dati mancanti'}, {status: 400});
        }

        const db = getDb();
        const esistente = db.prepare('SELECT id FROM veicoli WHERE targa = ? AND user_id = ?').get(targa, userId);
        if (esistente) {
            return NextResponse.json({
                success: false,
                message: 'Hai già registrato un veicolo con questa targa'
            }, {status: 400});
        }

        const result = db.prepare(
            'INSERT INTO veicoli (user_id, tipo, marca, modello, anno, targa, cilindrata) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(userId, tipo, marca, modello, anno ?? null, targa, cilindrata ?? null) as QueryResult;

        return NextResponse.json({
            success: true,
            veicoloId: result.lastInsertRowid,
            message: 'Veicolo aggiunto con successo'
        });
    } catch (error) {
        console.error('Errore durante il salvataggio del veicolo:', error);
        return NextResponse.json({success: false, message: 'Errore durante il salvataggio'}, {status: 500});
    }
}

export async function GET(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }

        const db = getDb();
        const veicoli = db.prepare(
            'SELECT id, tipo, marca, modello, anno, targa, cilindrata, data_creazione FROM veicoli WHERE user_id = ? ORDER BY data_creazione DESC'
        ).all(userId) as Veicolo[];

        return NextResponse.json({success: true, veicoli});
    } catch (error) {
        console.error('Errore durante il recupero dei veicoli:', error);
        return NextResponse.json({success: false, message: 'Errore durante il recupero dei veicoli'}, {status: 500});
    }
}

// Mantieni solo POST e GET, rimuovi PUT e DELETE
