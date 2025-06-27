import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    id: number;
    is_super_admin: number;
}

const getIdFromRequest = (request: NextRequest) =>
    request.nextUrl.pathname.split('/').pop();

export async function DELETE(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({error: 'Non autorizzato'}, {status: 401});

        const db = getDb();
        const requestUser = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!requestUser?.is_super_admin)
            return NextResponse.json({error: 'Solo i super admin possono eliminare admin'}, {status: 403});

        const adminId = getIdFromRequest(request);
        const adminToDelete = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(adminId) as User;
        if (!adminToDelete)
            return NextResponse.json({error: 'Admin non trovato'}, {status: 404});
        if (adminToDelete.is_super_admin)
            return NextResponse.json({error: 'Non è possibile eliminare un super admin'}, {status: 403});

        db.prepare('DELETE FROM users WHERE id = ?').run(adminId);
        return NextResponse.json({success: true, message: 'Admin eliminato con successo'});
    } catch {
        return NextResponse.json({error: "Errore durante l'eliminazione dell'admin"}, {status: 500});
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({error: 'Non autorizzato'}, {status: 401});

        const db = getDb();
        const requestUser = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!requestUser?.is_super_admin)
            return NextResponse.json({error: 'Solo i super admin possono modificare admin'}, {status: 403});

        const adminId = getIdFromRequest(request);
        const {nome, cognome, telefono} = await request.json();
        if (!nome || !cognome || !telefono)
            return NextResponse.json({error: 'Tutti i campi sono obbligatori'}, {status: 400});

        const adminToUpdate = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(adminId) as User;
        if (!adminToUpdate)
            return NextResponse.json({error: 'Admin non trovato'}, {status: 404});
        if (adminToUpdate.is_super_admin)
            return NextResponse.json({error: 'Non è possibile modificare un super admin'}, {status: 403});

        const existingUser = db.prepare('SELECT id FROM users WHERE telefono = ? AND id != ?').get(telefono, adminId);
        if (existingUser)
            return NextResponse.json({error: 'Numero di telefono già utilizzato da un altro utente'}, {status: 409});

        db.prepare('UPDATE users SET nome = ?, cognome = ?, telefono = ? WHERE id = ?').run(nome, cognome, telefono, adminId);
        return NextResponse.json({success: true, message: 'Admin aggiornato con successo'});
    } catch {
        return NextResponse.json({error: "Errore durante l'aggiornamento dell'admin"}, {status: 500});
    }
}