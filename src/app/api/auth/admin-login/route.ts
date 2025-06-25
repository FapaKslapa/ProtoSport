import {NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {generateToken} from '@/lib/auth';
import bcrypt from 'bcryptjs';

interface Admin {
    id: number;
    nome: string;
    cognome: string;
    password: string;
    is_admin: number;
    is_super_admin: number;
}

export async function POST(request: Request) {
    try {
        const {username, password} = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                {error: 'Username e password sono obbligatori'},
                {status: 400}
            );
        }

        const db = getDb();

        const admin = db.prepare(
            'SELECT id, nome, cognome, password, is_admin, is_super_admin FROM users WHERE telefono = ? AND is_super_admin = 1'
        ).get(username) as Admin | undefined;

        if (!admin) {
            return NextResponse.json(
                {error: 'Credenziali non valide'},
                {status: 401}
            );
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return NextResponse.json(
                {error: 'Credenziali non valide'},
                {status: 401}
            );
        }

        const token = generateToken(admin.id);

        return NextResponse.json({
            success: true,
            user: {
                id: admin.id,
                nome: admin.nome,
                cognome: admin.cognome,
                is_admin: admin.is_admin,
                is_super_admin: admin.is_super_admin
            },
            token
        });
    } catch (error) {
        console.error('Errore durante il login admin:', error);
        return NextResponse.json(
            {error: 'Errore durante il login'},
            {status: 500}
        );
    }
}