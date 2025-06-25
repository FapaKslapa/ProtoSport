    import { NextRequest, NextResponse } from 'next/server';
    import { getDb } from '@/lib/db';
    import { verifyToken } from '@/lib/auth';

    // Definizione delle interfacce per i tipi
    interface User {
      id: number;
      is_admin: boolean;
    }

    interface Servizio {
      id: number;
      nome: string;
      descrizione: string | null;
      durata_minuti: number;
      prezzo: number;
    }

    interface QueryCount {
      count: number;
    }

    // GET - Ottieni un servizio specifico
    export async function GET(
      request: NextRequest,
      { params }: { params: { id: string } }
    ) {
      try {
        const id = params.id;
        const db = getDb();
        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;

        if (!servizio) {
          return NextResponse.json(
            { success: false, error: 'Servizio non trovato' },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true, data: servizio });
      } catch (error) {
        console.error('Errore nel recupero del servizio:', error);
        return NextResponse.json(
          { success: false, error: 'Errore nel recupero del servizio' },
          { status: 500 }
        );
      }
    }

    // PUT - Aggiorna un servizio
    export async function PUT(
      request: NextRequest,
      { params }: { params: { id: string } }
    ) {
      try {
        // Verifica autenticazione (solo admin)
        const userId = verifyToken(request);
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Non autorizzato' },
            { status: 401 }
          );
        }

        // Verifica che l'utente sia admin
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user || !user.is_admin) {
          return NextResponse.json(
            { success: false, error: 'Accesso negato: richiesti privilegi di amministratore' },
            { status: 403 }
          );
        }

        const id = params.id;
        const { nome, descrizione, durata_minuti, prezzo } = await request.json();

        // Validazione
        if (!nome || !durata_minuti || prezzo === undefined) {
          return NextResponse.json(
            { success: false, error: 'Dati mancanti' },
            { status: 400 }
          );
        }

        // Verifica esistenza servizio
        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;
        if (!servizio) {
          return NextResponse.json(
            { success: false, error: 'Servizio non trovato' },
            { status: 404 }
          );
        }

        // Aggiornamento
        db.prepare(
          'UPDATE servizi SET nome = ?, descrizione = ?, durata_minuti = ?, prezzo = ? WHERE id = ?'
        ).run(nome, descrizione || null, durata_minuti, prezzo, id);

        return NextResponse.json({
          success: true,
          data: { id: parseInt(id), nome, descrizione, durata_minuti, prezzo }
        });
      } catch (error) {
        console.error('Errore nell\'aggiornamento del servizio:', error);
        return NextResponse.json(
          { success: false, error: 'Errore nell\'aggiornamento del servizio' },
          { status: 500 }
        );
      }
    }

    // DELETE - Elimina un servizio
    export async function DELETE(
      request: NextRequest,
      { params }: { params: { id: string } }
    ) {
      try {
        // Verifica autenticazione (solo admin)
        const userId = verifyToken(request);
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'Non autorizzato' },
            { status: 401 }
          );
        }

        // Verifica che l'utente sia admin
        const db = getDb();
        const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId) as User;
        if (!user || !user.is_admin) {
          return NextResponse.json(
            { success: false, error: 'Accesso negato: richiesti privilegi di amministratore' },
            { status: 403 }
          );
        }

        const id = params.id;

        // Verifica esistenza servizio
        const servizio = db.prepare('SELECT * FROM servizi WHERE id = ?').get(id) as Servizio;
        if (!servizio) {
          return NextResponse.json(
            { success: false, error: 'Servizio non trovato' },
            { status: 404 }
          );
        }

        // Controlla se ci sono prenotazioni legate al servizio
        const prenotazioni = db.prepare('SELECT COUNT(*) as count FROM prenotazioni WHERE servizio_id = ?').get(id) as QueryCount;
        if (prenotazioni && prenotazioni.count > 0) {
          return NextResponse.json(
            { success: false, error: 'Impossibile eliminare il servizio: esistono prenotazioni associate' },
            { status: 400 }
          );
        }

        // Eliminazione
        db.prepare('DELETE FROM servizi WHERE id = ?').run(id);

        return NextResponse.json({ success: true, message: 'Servizio eliminato con successo' });
      } catch (error) {
        console.error('Errore nell\'eliminazione del servizio:', error);
        return NextResponse.json(
          { success: false, error: 'Errore nell\'eliminazione del servizio' },
          { status: 500 }
        );
      }
    }