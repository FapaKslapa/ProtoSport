import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {generateToken} from '@/lib/auth';

interface VerificationRecord {
    id: number;
    telefono: string;
    code: string;
    created_at: string;
    expires_at: string;
    is_used: number;
}

interface User {
    id: number;
    nome: string;
    cognome: string;
    is_admin: number;
    is_super_admin: number;
}

export async function POST(request: Request) {
    try {
        const {telefono, code} = await request.json();
        if (!telefono || !code)
            return NextResponse.json({error: 'Telefono e codice sono obbligatori'}, {status: 400});

        const db = getDb();
        const verificationRecord = db.prepare(
            `SELECT *
             FROM verification_codes
             WHERE telefono = ?
               AND code = ?
               AND is_used = 0
               AND expires_at > datetime('now')
             ORDER BY created_at DESC LIMIT 1`
        ).get(telefono, code) as VerificationRecord | undefined;

        if (!verificationRecord)
            return NextResponse.json({error: 'Codice non valido o scaduto'}, {status: 400});

        db.prepare('UPDATE verification_codes SET is_used = 1 WHERE id = ?').run(verificationRecord.id);

        const user = db.prepare(
            'SELECT id, nome, cognome, is_admin, is_super_admin FROM users WHERE telefono = ?'
        ).get(telefono) as User | undefined;

        if (!user)
            return NextResponse.json({error: 'Utente non trovato'}, {status: 404});

        const token = generateToken(user.id);
        const dashboardType = user.is_admin || user.is_super_admin ? 'admin' : 'user';

        return NextResponse.json({
            success: true,
            message: 'Verifica completata con successo',
            user,
            token,
            dashboardType
        });
    } catch {
        return NextResponse.json({error: 'Errore durante la verifica'}, {status: 500});
    }
}