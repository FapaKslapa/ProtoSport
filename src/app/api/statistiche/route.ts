import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';
import {verifyToken} from '@/lib/auth';

interface User {
    is_super_admin: boolean;
}

export async function GET(request: NextRequest) {
    try {
        const userId = verifyToken(request);
        if (!userId) return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401});

        const db = getDb();

        const user = db.prepare('SELECT is_super_admin FROM users WHERE id = ?').get(userId) as User | undefined;
        if (!user?.is_super_admin) {
            return NextResponse.json({success: false, error: 'Accesso negato'}, {status: 403});
        }

        // Query statistiche
        const totUtenti = (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_super_admin = 0').get() as {
            count: number
        }).count;
        const totUtentiBase = (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0 AND is_super_admin = 0').get() as {
            count: number
        }).count;
        const totAdmin = (db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1 AND is_super_admin = 0').get() as {
            count: number
        }).count;
        const totPrenotazioni = (db.prepare('SELECT COUNT(*) as count FROM prenotazioni').get() as {
            count: number
        }).count;
        const totServizi = (db.prepare('SELECT COUNT(*) as count FROM servizi').get() as { count: number }).count;
        const totProfitti = (db.prepare(`
            SELECT IFNULL(SUM(s.prezzo), 0) as profitto
            FROM prenotazioni p
                     JOIN servizi s ON p.servizio_id = s.id
            WHERE p.stato = 'accettata'
        `).get() as { profitto: number }).profitto;

        const prenotazioniPerMese = db.prepare(`
            SELECT strftime('%Y-%m', data_prenotazione) as mese, COUNT(*) as count
            FROM prenotazioni
            GROUP BY mese
            ORDER BY mese
        `).all();

        const profittiPerMese = db.prepare(`
            SELECT strftime('%Y-%m', p.data_prenotazione) as mese, IFNULL(SUM(s.prezzo), 0) as profitto
            FROM prenotazioni p
                     JOIN servizi s ON p.servizio_id = s.id
            WHERE p.stato = 'accettata'
            GROUP BY mese
            ORDER BY mese
        `).all();

        const utentiPerMese = db.prepare(`
            SELECT strftime('%Y-%m', data_creazione) as mese, COUNT(*) as count
            FROM users
            WHERE is_super_admin = 0
            GROUP BY mese
            ORDER BY mese
        `).all();

        // Nuove statistiche veicoli e prenotazioni
        const totVeicoli = (db.prepare('SELECT COUNT(*) as count FROM veicoli').get() as { count: number }).count;

        const oggi = new Date().toISOString().slice(0, 10);
        const prenotazioniPassate = (db.prepare('SELECT COUNT(*) as count FROM prenotazioni WHERE data_prenotazione < ?').get(oggi) as {
            count: number
        }).count;
        const prenotazioniFuture = (db.prepare('SELECT COUNT(*) as count FROM prenotazioni WHERE data_prenotazione > ?').get(oggi) as {
            count: number
        }).count;
        const prenotazioniOggi = (db.prepare('SELECT COUNT(*) as count FROM prenotazioni WHERE data_prenotazione = ?').get(oggi) as {
            count: number
        }).count;

        return NextResponse.json({
            success: true,
            data: {
                totPrenotazioni,
                totUtenti,
                totUtentiBase,
                totAdmin,
                totServizi,
                totProfitti,
                prenotazioniPerMese,
                profittiPerMese,
                utentiPerMese,
                totVeicoli,
                prenotazioniPassate,
                prenotazioniFuture,
                prenotazioniOggi
            }
        });
    } catch {
        return NextResponse.json({success: false, error: 'Errore nel recupero delle statistiche'}, {status: 500});
    }
}