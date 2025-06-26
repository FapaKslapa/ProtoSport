import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';

interface Disponibilita {
    ora_inizio: string;
    ora_fine: string;
}

interface Servizio {
    durata_minuti: number;
}

interface Prenotazione {
    ora_inizio: string;
    ora_fine: string;
}

function convertiInMinuti(ora: string): number {
    const [h, m] = ora.split(':').map(Number);
    return h * 60 + m;
}

function convertiInOrario(minuti: number): string {
    const h = Math.floor(minuti / 60);
    const m = minuti % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const data = searchParams.get('data');
        const servizioId = searchParams.get('servizio_id');

        if (!data || !servizioId) {
            return NextResponse.json({success: false, error: 'Parametri mancanti'}, {status: 400});
        }

        const db = getDb();
        const giornoSettimana = new Date(data).getDay();

        // Orari apertura/chiusura
        const disponibilita = db.prepare('SELECT ora_inizio, ora_fine FROM disponibilita WHERE giorno_settimana = ?')
            .get(giornoSettimana) as Disponibilita | undefined;
        if (!disponibilita) {
            return NextResponse.json({success: true, data: []});
        }

        // Durata servizio
        const servizio = db.prepare('SELECT durata_minuti FROM servizi WHERE id = ?').get(servizioId) as Servizio | undefined;
        if (!servizio) {
            return NextResponse.json({success: false, error: 'Servizio non trovato'}, {status: 404});
        }
        const durata = servizio.durata_minuti;

        // Prenotazioni esistenti ordinate per ora_inizio
        const prenotazioni = db.prepare(`
            SELECT ora_inizio, ora_fine
            FROM prenotazioni
            WHERE data_prenotazione = ?
            ORDER BY ora_inizio
        `).all(data) as Prenotazione[];

        const apertura = convertiInMinuti(disponibilita.ora_inizio);
        const chiusura = convertiInMinuti(disponibilita.ora_fine);

        // Costruisci intervalli liberi tra prenotazioni, lasciando 20 minuti di pausa dopo ogni prenotazione
        let intervalliLiberi: { inizio: number, fine: number }[] = [];
        let inizioLibero = apertura;

        for (const p of prenotazioni) {
            const pInizio = convertiInMinuti(p.ora_inizio);
            if (inizioLibero < pInizio) {
                intervalliLiberi.push({inizio: inizioLibero, fine: pInizio});
            }
            // 20 minuti di pausa dopo la fine della prenotazione
            inizioLibero = Math.max(inizioLibero, convertiInMinuti(p.ora_fine) + 20);
        }
        if (inizioLibero < chiusura) {
            intervalliLiberi.push({inizio: inizioLibero, fine: chiusura});
        }

        // Genera slot ogni 30 minuti per ogni intervallo libero, solo se c'è spazio per la durata del servizio
        const fasce: { ora_inizio: string; ora_fine: string }[] = [];
        for (const intervallo of intervalliLiberi) {
            // Trova il primo slot allineato ai 30 minuti
            let inizio = intervallo.inizio;
            const offset = inizio % 30;
            if (offset !== 0) inizio += (30 - offset);

            while (inizio + durata <= intervallo.fine) {
                fasce.push({
                    ora_inizio: convertiInOrario(inizio),
                    ora_fine: convertiInOrario(inizio + durata)
                });
                inizio += 30;
            }
        }

        return NextResponse.json({success: true, data: fasce});
    } catch (error) {
        return NextResponse.json({success: false, error: 'Errore nel calcolo delle fasce'}, {status: 500});
    }
}