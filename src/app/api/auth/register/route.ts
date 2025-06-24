import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateVerificationCode, sendSms } from '@/lib/smsService';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { nome, cognome, telefono, password } = await request.json();

        // Validazione campi obbligatori
        if (!nome || !cognome || !telefono || !password) {
            return NextResponse.json(
                { error: 'Tutti i campi sono obbligatori' },
                { status: 400 }
            );
        }

        const db = getDb();

        // Verifica se l'utente esiste già
        const existingUser = db.prepare('SELECT * FROM users WHERE telefono = ?').get(telefono);

        if (existingUser) {
            return NextResponse.json(
                { error: 'Utente già registrato con questo numero di telefono' },
                { status: 409 }
            );
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Registra l'utente nel database
        const result = db.prepare(
            'INSERT INTO users (nome, cognome, telefono, password, is_admin) VALUES (?, ?, ?, ?, 0)'
        ).run(nome, cognome, telefono, hashedPassword);

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
        const message = `Benvenuto/a ${nome}! Il tuo codice di verifica è: ${code}`;
        const smsResult = await sendSms(telefono, message);

        if (!smsResult) {
            return NextResponse.json(
                { error: 'Impossibile inviare SMS di verifica' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Registrazione completata. Codice di verifica inviato al tuo numero di telefono',
            userId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        return NextResponse.json(
            { error: 'Errore durante la registrazione' },
            { status: 500 }
        );
    }
}

