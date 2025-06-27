import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';

function toMin(ora: string) {
    const [h, m] = ora.split(':').map(Number);
    return h * 60 + m;
}

function toOra(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const data = params.get('data');
        const servizioId = params.get('servizio_id');
        if (!data || !servizioId)
            return NextResponse.json({success: false, error: 'Parametri mancanti'}, {status: 400});

        const db = getDb();
        const giornoSettimana = new Date(data).getDay();
        const disponibilita = db.prepare('SELECT ora_inizio, ora_fine FROM disponibilita WHERE giorno_settimana = ?')
            .get(giornoSettimana);
        if (!disponibilita)
            return NextResponse.json({success: true, data: []});

        const servizio = db.prepare('SELECT durata_minuti FROM servizi WHERE id = ?').get(servizioId);
        if (!servizio)
            return NextResponse.json({success: false, error: 'Servizio non trovato'}, {status: 404});
        const durata = servizio.durata_minuti;

        const prenotazioni = db.prepare(`
                                SELECT ora_inizio, ora_fine
                                FROM prenotazioni
                                WHERE data_prenotazione = ?
                                ORDER BY ora_inizio
                            `).all(data);

        const apertura = toMin(disponibilita.ora_inizio);
        const chiusura = toMin(disponibilita.ora_fine);
        let intervalli: { inizio: number, fine: number }[] = [];
        let inizioLibero = apertura;

        for (const p of prenotazioni) {
            const pInizio = toMin(p.ora_inizio);
            if (inizioLibero < pInizio)
                intervalli.push({inizio: inizioLibero, fine: pInizio});
            inizioLibero = Math.max(inizioLibero, toMin(p.ora_fine) + 20);
        }
        if (inizioLibero < chiusura)
            intervalli.push({inizio: inizioLibero, fine: chiusura});

        const fasce: { ora_inizio: string, ora_fine: string }[] = [];
        for (const intervallo of intervalli) {
            let inizio = intervallo.inizio;
            const offset = inizio % 30;
            if (offset !== 0) inizio += (30 - offset);
            while (inizio + durata <= intervallo.fine) {
                fasce.push({ora_inizio: toOra(inizio), ora_fine: toOra(inizio + durata)});
                inizio += 30;
            }
        }
        return NextResponse.json({success: true, data: fasce});
    } catch {
        return NextResponse.json({success: false, error: 'Errore nel calcolo delle fasce'}, {status: 500});
    }
}