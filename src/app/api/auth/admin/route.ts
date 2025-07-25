import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    id: number;
    is_super_admin: number;
}

export async function GET(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId)
            return NextResponse.json({error: 'Non autorizzato'}, {status: 401});

        const db = getDb();
        const user = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_super_admin)
            return NextResponse.json({error: 'Solo i super admin possono accedere a questa risorsa'}, {status: 403});

        const admins = db.prepare(
            'SELECT id, nome, cognome, telefono FROM users WHERE is_admin = 1 AND is_super_admin = 0'
        ).all();

        return NextResponse.json({success: true, admins});
    } catch {
        return NextResponse.json({error: 'Errore durante il recupero degli admin'}, {status: 500});
    }
}