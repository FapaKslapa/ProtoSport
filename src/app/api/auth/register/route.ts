import {NextResponse} from 'next/server';
            import {getDb} from '@/lib/db';
            import bcrypt from 'bcryptjs';

            export async function POST(request: Request) {
                try {
                    const {nome, cognome, telefono, password} = await request.json();

                    // Validazione campi obbligatori
                    if (!nome || !cognome || !telefono || !password) {
                        return NextResponse.json(
                            {error: 'Tutti i campi sono obbligatori'},
                            {status: 400}
                        );
                    }

                    const db = getDb();

                    // Formatta il numero di telefono aggiungendo +39 se non è già presente
                    const telefonoFormattato = telefono.startsWith('+39') ? telefono : `+39${telefono}`;

                    // Verifica se l'utente esiste già
                    const existingUser = db.prepare('SELECT * FROM users WHERE telefono = ?').get(telefonoFormattato);

                    if (existingUser) {
                        return NextResponse.json(
                            {error: 'Utente già registrato con questo numero di telefono'},
                            {status: 409}
                        );
                    }

                    // Hash della password
                    const hashedPassword = await bcrypt.hash(password, 10);

                    // Registra l'utente nel database
                    const result = db.prepare(
                        'INSERT INTO users (nome, cognome, telefono, password, is_admin) VALUES (?, ?, ?, ?, 0)'
                    ).run(nome, cognome, telefonoFormattato, hashedPassword);

                    return NextResponse.json({
                        success: true,
                        message: 'Registrazione completata con successo',
                        userId: result.lastInsertRowid
                    });
                } catch (error) {
                    console.error('Errore durante la registrazione:', error);
                    return NextResponse.json(
                        {error: 'Errore durante la registrazione'},
                        {status: 500}
                    );
                }
            }