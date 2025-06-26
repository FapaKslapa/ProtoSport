import {NextRequest, NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import {verifyToken} from '@/lib/auth';
import {getDb} from '@/lib/db';

const SECRET = process.env.GOOGLE_CALENDAR_SECRET || "sviluppo_super_segreto";

export async function GET(request: NextRequest) {
    const userId = verifyToken(request);
    if (!userId) {
        return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});
    }
    const db = getDb();
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as { is_admin: boolean };
    if (!user?.is_admin) {
        return NextResponse.json({success: false, error: 'Solo admin'}, {status: 403});
    }
    const token = jwt.sign({userId, type: 'google-calendar'}, SECRET, {expiresIn: '7d'});
    return NextResponse.json({success: true, token});
}