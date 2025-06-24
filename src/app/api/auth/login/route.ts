import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {generateVerificationCode, sendSms} from '@/lib/smsService';

export async function POST(request: Request) {
    try {
        const {telefono} = await request.json();

        if (!telefono) {
            return NextResponse.json(
                {error: 'Numero di telefono richiesto'},
                {status: 400}
            );
        }

        const db = getDb();

        // Verifica se l'utente esiste
        const user = db.prepare('SELECT * FROM users WHERE telefono = ?').get(telefono);

        if (!user) {
            return NextResponse.json(
                {error: 'Utente non trovato'},
                {status: 404}
            );
        }

        // Genera codice di verifica a 6 cifre
        const code = generateVerificationCode();

        // Imposta scadenza a 10 minuti
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Salva il codice nel database
        db.prepare(
            'INSERT INTO verification_codes (telefono, code, expires_at) VALUES (?, ?, ?)'
        ).run(telefono, code, expiresAt.toISOString());

        // Invia SMS con il codice
        const message = `Il tuo codice di verifica è: ${code}`;
        const smsResult = await sendSms(telefono, message);

        if (!smsResult) {
            return NextResponse.json(
                {error: 'Impossibile inviare SMS di verifica'},
                {status: 500}
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Codice di verifica inviato al tuo numero di telefono'
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        return NextResponse.json(
            {error: 'Errore durante il login'},
            {status: 500}
        );
    }
}

