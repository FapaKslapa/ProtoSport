// src/app/api/veicoli/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verifica autenticazione
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, message: 'Non autorizzato'},
                {status: 401}
            );
        }

        const {marca, modello, anno, tipo, cilindrata, targa} = await request.json();

        // Validazione base
        if (!marca || !modello || !tipo || !targa) {
            return NextResponse.json(
                {success: false, message: 'Dati mancanti'},
                {status: 400}
            );
        }

        const db = getDb();

        /// Verifica che la targa non sia già presente per lo stesso utente
        const esistente = db.prepare('SELECT id FROM veicoli WHERE targa = ? AND utente_id = ?').get(targa, userId);
        if (esistente) {
            return NextResponse.json(
                {success: false, message: 'Hai già registrato un veicolo con questa targa'},
                {status: 400}
            );
        }

        // Inserisci il veicolo
        const result = db.prepare(`
            INSERT INTO veicoli (utente_id, tipo, marca, modello, anno, targa, cilindrata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, tipo, marca, modello, anno || null, targa, cilindrata || null);

        return NextResponse.json({
            success: true,
            veicoloId: result.lastInsertRowid,
            message: 'Veicolo aggiunto con successo'
        });
    } catch (error) {
        console.error('Errore durante il salvataggio del veicolo:', error);
        return NextResponse.json(
            {success: false, message: 'Errore durante il salvataggio'},
            {status: 500}
        );
    }
}

// Aggiungi questo metodo al file src/app/api/veicoli/route.ts

export async function GET(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) {
            return NextResponse.json(
                {success: false, message: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();

        const veicoli = db.prepare(`
            SELECT id,
                   tipo,
                   marca,
                   modello,
                   anno,
                   targa,
                   cilindrata,
                   data_creazione
            FROM veicoli
            WHERE utente_id = ?
            ORDER BY data_creazione DESC
        `).all(userId);

        return NextResponse.json({
            success: true,
            veicoli
        });
    } catch (error) {
        console.error('Errore durante il recupero dei veicoli:', error);
        return NextResponse.json(
            {success: false, message: 'Errore durante il recupero dei veicoli'},
            {status: 500}
        );
    }
}