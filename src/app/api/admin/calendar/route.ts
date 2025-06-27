import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';
import ical from 'ical-generator';
import jwt from 'jsonwebtoken';

const SECRET = process.env.GOOGLE_CALENDAR_SECRET || 'sviluppo_super_segreto';

interface User {
    is_admin: boolean;
}

export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const googleToken = searchParams.get('token');
        let userId: string | null = null;

        if (googleToken) {
            try {
                const payload = jwt.verify(googleToken, SECRET) as any;
                if (payload.type === 'google-calendar') userId = String(payload.userId);
            } catch {
                return NextResponse.json({success: false, error: 'Token non valido'}, {status: 401});
            }
        } else {
            const verified = verifyToken(request);
            userId = verified ? String(verified) : null;
        }

        if (!userId) return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});

        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user?.is_admin) return NextResponse.json({success: false, error: 'Solo admin'}, {status: 403});

        const prenotazioni = db.prepare(`
            SELECT p.id,
                   p.data_prenotazione,
                   p.ora_inizio,
                   p.ora_fine,
                   u.nome    as user_nome,
                   u.cognome as user_cognome,
                   s.nome    as servizio_nome,
                   v.marca,
                   v.modello,
                   v.targa
            FROM prenotazioni p
                     JOIN users u ON p.user_id = u.id
                     JOIN servizi s ON p.servizio_id = s.id
                     JOIN veicoli v ON p.veicolo_id = v.id
            ORDER BY p.data_prenotazione, p.ora_inizio
        `).all() || [];

        const cal = ical({name: 'Prenotazioni Officina'});

        prenotazioni.forEach((p: any) => {
            const start = new Date(`${p.data_prenotazione}T${p.ora_inizio}:00`);
            const end = new Date(`${p.data_prenotazione}T${p.ora_fine}:00`);
            cal.createEvent({
                id: `prenotazione-${p.id}`,
                start,
                end,
                summary: `${p.servizio_nome} - ${p.user_nome} ${p.user_cognome}`,
                description: `Veicolo: ${p.marca} ${p.modello} (${p.targa})`,
            });
        });

        return new NextResponse(cal.toString(), {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="prenotazioni-admin.ics"',
            },
        });
    } catch {
        return NextResponse.json({success: false, error: 'Errore generazione calendario'}, {status: 500});
    }
}