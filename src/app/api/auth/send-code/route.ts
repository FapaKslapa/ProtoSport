// src/app/api/auth/send-code/route.ts
import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {sendSms, generateVerificationCode} from '@/lib/smsService';

// Funzione per normalizzare il numero di telefono per la ricerca nel database
function normalizePhoneNumber(phoneNumber: string): string {
    // Rimuove spazi e altri caratteri non numerici eccetto il +
    let cleaned = phoneNumber.replace(/\s+/g, '');

    // Rimuove il prefisso +39 o 0039 se presente
    if (cleaned.startsWith('+39')) {
        return cleaned.substring(3);
    } else if (cleaned.startsWith('0039')) {
        return cleaned.substring(4);
    }

    return cleaned;
}

export async function POST(request: Request) {
    try {
        const {telefono} = await request.json();

        if (!telefono) {
            return NextResponse.json(
                {error: 'Il numero di telefono è obbligatorio'},
                {status: 400}
            );
        }

        const db = getDb();
        const normalizedPhone = normalizePhoneNumber(telefono);

        // Verifica se l'utente esiste usando il numero normalizzato
        // e una query che cerca sia con che senza prefisso
        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE telefono = ?
               OR telefono = ?
               OR telefono = ?
               OR telefono = ?
        `).get(
            normalizedPhone,           // Numero senza prefisso
            '+39' + normalizedPhone,   // Con prefisso +39
            '0039' + normalizedPhone,  // Con prefisso 0039
            telefono                   // Numero originale
        );

        if (!user) {
            return NextResponse.json(
                {error: 'Nessun utente trovato con questo numero di telefono'},
                {status: 404}
            );
        }

        // Genera codice di verifica
        const code = generateVerificationCode().substring(0, 4); // Prendo solo 4 cifre
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Scade tra 15 minuti

        // Salva il codice nel database con il numero originale
        db.prepare(`
            INSERT INTO verification_codes
                (telefono, code, expires_at)
            VALUES (?, ?, ?)
        `).run(telefono, code, expiresAt.toISOString());

        // Invia SMS (la funzione sendSms già gestisce il formato del numero)
        const message = `Il tuo codice di verifica è: ${code}`;
        if(process.env.NODE_ENV !== 'development')
        await sendSms(telefono, message);
        else
            console.log(message);

        return NextResponse.json({
            success: true,
            message: 'Codice di verifica inviato con successo'
        });
    } catch (error) {
        console.error('Errore durante l\'invio del codice:', error);
        return NextResponse.json(
            {error: 'Errore durante l\'invio del codice di verifica'},
            {status: 500}
        );
    }
}