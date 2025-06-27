import {NextRequest} from 'next/server';
import {getDb} from './db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chiave-segreta-temporanea';

export function verifyToken(request: NextRequest): number | null {
    try {
        const authToken = request.cookies.get('authToken')?.value ||
            request.headers.get('Authorization')?.replace('Bearer ', '');

        if (!authToken) {
            return null;
        }

        const decoded = jwt.verify(authToken, JWT_SECRET) as { userId: number };

        const db = getDb();
        const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);

        if (!user) {
            return null;
        }

        return decoded.userId;
    } catch (error) {
        console.error('Errore nella verifica del token:', error);
        return null;
    }
}

export function generateToken(userId: number): string {
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: '7d'});
}