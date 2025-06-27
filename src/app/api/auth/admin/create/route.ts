import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    id?: number;
    is_super_admin: number;
}

export async function POST(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({error: 'Non autorizzato'}, {status: 401});

        const db = getDb();
        const requestUser = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!requestUser?.is_super_admin)
            return NextResponse.json({error: 'Solo i super admin possono creare altri admin'}, {status: 403});

        const {nome, cognome, telefono} = await request.json();
        if (!nome || !cognome || !telefono)
            return NextResponse.json({error: 'Tutti i campi sono obbligatori'}, {status: 400});

        const existingUser = db.prepare('SELECT id FROM users WHERE telefono = ?').get(telefono);
        if (existingUser)
            return NextResponse.json({error: 'Utente già esistente con questo numero di telefono'}, {status: 409});

        const result = db.prepare(
            'INSERT INTO users (nome, cognome, telefono, is_admin, is_super_admin) VALUES (?, ?, ?, 1, 0)'
        ).run(nome, cognome, telefono);

        return NextResponse.json({
            success: true,
            message: 'Admin creato con successo',
            adminId: result.lastInsertRowid
        });
    } catch {
        return NextResponse.json({error: "Errore durante la creazione dell'admin"}, {status: 500});
    }
}