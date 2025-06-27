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

export async function PUT(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }

        const {id, marca, modello, anno, tipo, cilindrata, targa} = await request.json();
        if (!id || !marca || !modello || !tipo || !targa) {
            return NextResponse.json({success: false, message: 'Dati mancanti'}, {status: 400});
        }

        const db = getDb();
        const veicolo = db.prepare('SELECT id FROM veicoli WHERE id = ? AND user_id = ?').get(id, userId);
        if (!veicolo) {
            return NextResponse.json({success: false, message: 'Veicolo non trovato'}, {status: 404});
        }

        const esistente = db.prepare('SELECT id FROM veicoli WHERE targa = ? AND user_id = ? AND id != ?').get(targa, userId, id);
        if (esistente) {
            return NextResponse.json({
                success: false,
                message: 'Hai già registrato un veicolo con questa targa'
            }, {status: 400});
        }

        db.prepare(
            'UPDATE veicoli SET marca = ?, modello = ?, anno = ?, tipo = ?, cilindrata = ?, targa = ? WHERE id = ? AND user_id = ?'
        ).run(marca, modello, anno ?? null, tipo, cilindrata ?? null, targa, id, userId);

        return NextResponse.json({success: true, message: 'Veicolo aggiornato con successo'});
    } catch (error) {
        console.error('Errore durante la modifica del veicolo:', error);
        return NextResponse.json({success: false, message: 'Errore durante la modifica'}, {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }

        const {id} = await request.json();
        if (!id) {
            return NextResponse.json({success: false, message: 'ID veicolo mancante'}, {status: 400});
        }

        const db = getDb();
        const veicolo = db.prepare('SELECT id FROM veicoli WHERE id = ? AND user_id = ?').get(id, userId);
        if (!veicolo) {
            return NextResponse.json({success: false, message: 'Veicolo non trovato'}, {status: 404});
        }

        const oggi = new Date().toISOString().slice(0, 10);
        const prenotazioneFutura = db.prepare(
            'SELECT 1 FROM prenotazioni WHERE veicolo_id = ? AND data_prenotazione >= ? LIMIT 1'
        ).get(id, oggi);

        if (prenotazioneFutura) {
            return NextResponse.json({
                success: false,
                message: 'Non puoi eliminare un veicolo con prenotazioni future'
            }, {status: 400});
        }

        db.prepare('DELETE FROM veicoli WHERE id = ? AND user_id = ?').run(id, userId);

        return NextResponse.json({success: true, message: 'Veicolo eliminato con successo'});
    } catch (error) {
        console.error('Errore durante l\'eliminazione del veicolo:', error);
        return NextResponse.json({success: false, message: 'Errore durante l\'eliminazione'}, {status: 500});
    }
}