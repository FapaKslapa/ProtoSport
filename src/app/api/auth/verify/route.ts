import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';

// Definizione dell'interfaccia per il record di verifica
interface VerificationRecord {
    id: number;
    telefono: string;
    code: string;
    created_at: string;
    expires_at: string;
    is_used: number;
}

export async function POST(request: Request) {
    try {
        const {telefono, code} = await request.json();

        if (!telefono || !code) {
            return NextResponse.json(
                {error: 'Telefono e codice sono obbligatori'},
                {status: 400}
            );
        }

        const db = getDb();

        // Aggiungiamo type assertion al risultato della query
        const verificationRecord = db.prepare(`
            SELECT *
            FROM verification_codes
            WHERE telefono = ?
              AND code = ?
              AND is_used = 0
              AND expires_at > datetime('now')
            ORDER BY created_at DESC LIMIT 1
        `).get(telefono, code) as VerificationRecord | undefined;

        if (!verificationRecord) {
            return NextResponse.json(
                {error: 'Codice non valido o scaduto'},
                {status: 400}
            );
        }

        db.prepare('UPDATE verification_codes SET is_used = 1 WHERE id = ?')
            .run(verificationRecord.id);

        // Recupera informazioni utente
        const user = db.prepare(
            'SELECT id, nome, cognome, is_admin FROM users WHERE telefono = ?'
        ).get(telefono);

        // Generazione token di sessione
        const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        return NextResponse.json({
            success: true,
            message: 'Verifica completata con successo',
            user,
            token: sessionToken
        });
    } catch (error) {
        console.error('Errore durante la verifica:', error);
        return NextResponse.json(
            {error: 'Errore durante la verifica'},
            {status: 500}
        );
    }
}