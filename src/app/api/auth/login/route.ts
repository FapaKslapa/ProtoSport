import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {generateVerificationCode, sendSms} from '@/lib/smsService';

export async function POST(request: Request) {
    try {
        const {telefono} = await request.json();
        if (!telefono)
            return NextResponse.json({error: 'Numero di telefono richiesto'}, {status: 400});

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE telefono = ?').get(telefono);
        if (!user)
            return NextResponse.json({error: 'Utente non trovato'}, {status: 404});

        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

        db.prepare(
            'INSERT INTO verification_codes (telefono, code, expires_at) VALUES (?, ?, ?)'
        ).run(telefono, code, expiresAt);

        const smsResult = await sendSms(telefono, `Il tuo codice di verifica è: ${code}`);
        if (!smsResult)
            return NextResponse.json({error: 'Impossibile inviare SMS di verifica'}, {status: 500});

        return NextResponse.json({success: true, message: 'Codice di verifica inviato al tuo numero di telefono'});
    } catch {
        return NextResponse.json({error: 'Errore durante il login'}, {status: 500});
    }
}