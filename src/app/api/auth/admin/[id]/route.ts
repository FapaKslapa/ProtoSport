import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';
import {NextRequest} from 'next/server';

interface User {
    id: number;
    is_super_admin: number;
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = verifyToken(request);

        if (!userId) {
            return NextResponse.json(
                {error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();

        // Verifica se l'utente è un super admin
        const requestUser = db.prepare(
            'SELECT is_super_admin FROM users WHERE id = ?'
        ).get(userId) as User | undefined;

        if (!requestUser || !requestUser.is_super_admin) {
            return NextResponse.json(
                {error: 'Solo i super admin possono eliminare admin'},
                {status: 403}
            );
        }

        // Estrai l'id dalla URL
        const adminId = request.nextUrl.pathname.split('/').pop();

        // Verifica che l'admin da eliminare esista e non sia un super admin
        const adminToDelete = db.prepare(
            'SELECT is_super_admin FROM users WHERE id = ?'
        ).get(adminId) as User | undefined;

        if (!adminToDelete) {
            return NextResponse.json(
                {error: 'Admin non trovato'},
                {status: 404}
            );
        }

        if (adminToDelete.is_super_admin) {
            return NextResponse.json(
                {error: 'Non è possibile eliminare un super admin'},
                {status: 403}
            );
        }

        // Elimina l'admin
        db.prepare('DELETE FROM users WHERE id = ?').run(adminId);

        return NextResponse.json({
            success: true,
            message: 'Admin eliminato con successo'
        });
    } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'admin:', error);
        return NextResponse.json(
            {error: 'Errore durante l\'eliminazione dell\'admin'},
            {status: 500}
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = verifyToken(request);

        if (!userId) {
            return NextResponse.json(
                {error: 'Non autorizzato'},
                {status: 401}
            );
        }

        const db = getDb();

        // Verifica se l'utente è un super admin
        const requestUser = db.prepare(
            'SELECT is_super_admin FROM users WHERE id = ?'
        ).get(userId) as User | undefined;

        if (!requestUser || !requestUser.is_super_admin) {
            return NextResponse.json(
                {error: 'Solo i super admin possono modificare admin'},
                {status: 403}
            );
        }

        // Estrai l'id dalla URL
        const adminId = request.nextUrl.pathname.split('/').pop();
        const {nome, cognome, telefono} = await request.json();

        if (!nome || !cognome || !telefono) {
            return NextResponse.json(
                {error: 'Tutti i campi sono obbligatori'},
                {status: 400}
            );
        }

        // Verifica che l'admin da modificare esista e non sia un super admin
        const adminToUpdate = db.prepare(
            'SELECT is_super_admin FROM users WHERE id = ?'
        ).get(adminId) as User | undefined;

        if (!adminToUpdate) {
            return NextResponse.json(
                {error: 'Admin non trovato'},
                {status: 404}
            );
        }

        if (adminToUpdate.is_super_admin) {
            return NextResponse.json(
                {error: 'Non è possibile modificare un super admin'},
                {status: 403}
            );
        }

        const existingUser = db.prepare(
            'SELECT id FROM users WHERE telefono = ? AND id != ?'
        ).get(telefono, adminId);

        if (existingUser) {
            return NextResponse.json(
                {error: 'Numero di telefono già utilizzato da un altro utente'},
                {status: 409}
            );
        }

        // Aggiorna l'admin
        db.prepare(
            'UPDATE users SET nome = ?, cognome = ?, telefono = ? WHERE id = ?'
        ).run(nome, cognome, telefono, adminId);

        return NextResponse.json({
            success: true,
            message: 'Admin aggiornato con successo'
        });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'admin:', error);
        return NextResponse.json(
            {error: 'Errore durante l\'aggiornamento dell\'admin'},
            {status: 500}
        );
    }
}