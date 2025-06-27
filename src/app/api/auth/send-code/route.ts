import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {sendSms, generateVerificationCode} from '@/lib/smsService';

function normalizePhoneNumber(phone: string) {
    let n = phone.replace(/\s+/g, '');
    if (n.startsWith('+39')) return n.substring(3);
    if (n.startsWith('0039')) return n.substring(4);
    return n;
}

export async function POST(request: Request) {
    try {
        const {telefono} = await request.json();
        if (!telefono)
            return NextResponse.json({error: 'Il numero di telefono è obbligatorio'}, {status: 400});

        const db = getDb();
        const normalized = normalizePhoneNumber(telefono);
        const user = db.prepare(
            'SELECT id FROM users WHERE telefono = ? OR telefono = ? OR telefono = ? OR telefono = ?'
        ).get(normalized, '+39' + normalized, '0039' + normalized, telefono);

        if (!user)
            return NextResponse.json({error: 'Nessun utente trovato con questo numero di telefono'}, {status: 404});

        const code = generateVerificationCode().substring(0, 4);
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

        db.prepare(
            'INSERT INTO verification_codes (telefono, code, expires_at) VALUES (?, ?, ?)'
        ).run(telefono, code, expiresAt);

        const message = `Il tuo codice di verifica è: ${code}`;
        if (process.env.NODE_ENV !== 'development') await sendSms(telefono, message);
        else console.log(message);

        return NextResponse.json({success: true, message: 'Codice di verifica inviato con successo'});
    } catch {
        return NextResponse.json({error: 'Errore durante l\'invio del codice di verifica'}, {status: 500});
    }
}