import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }
        const id = Number(params.id);
        const {marca, modello, anno, tipo, cilindrata, targa} = await request.json();
        if (!marca || !modello || !tipo || !targa) {
            return NextResponse.json({success: false, message: 'Dati mancanti'}, {status: 400});
        }
        const db = getDb();
        const veicolo = db.prepare('SELECT id FROM veicoli WHERE id = ? AND user_id = ?').get(id, userId);
        if (!veicolo) {
            return NextResponse.json({success: false, message: 'Veicolo non trovato'}, {status: 404});
        }
        // Blocco modifica se ci sono prenotazioni future
        const oggi = new Date().toISOString().slice(0, 10);
        const prenotazioneFutura = db.prepare(
            'SELECT 1 FROM prenotazioni WHERE veicolo_id = ? AND data_prenotazione >= ? LIMIT 1'
        ).get(id, oggi);
        if (prenotazioneFutura) {
            return NextResponse.json({
                success: false,
                message: 'Non puoi modificare un veicolo con prenotazioni future'
            }, {status: 400});
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
        return NextResponse.json({success: false, message: 'Errore durante la modifica'}, {status: 500});
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json({success: false, message: 'Non autorizzato'}, {status: 401});
        }
        const id = Number(params.id);
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
        return NextResponse.json({success: false, message: 'Errore durante l\'eliminazione'}, {status: 500});
    }
}

