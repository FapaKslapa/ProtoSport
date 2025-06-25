"use client";

        import {useState, useRef, useEffect} from 'react';
        import Link from 'next/link';
        import {useRouter, useSearchParams} from 'next/navigation';
        import Cookies from 'js-cookie';

        export default function VerifyCode() {
            const [codeValues, setCodeValues] = useState(['', '', '', '']);
            const [isLoading, setIsLoading] = useState(false);
            const [error, setError] = useState('');
            const [telefono, setTelefono] = useState('');
            const router = useRouter();
            const searchParams = useSearchParams();

            const inputRefs = [
                useRef<HTMLInputElement>(null),
                useRef<HTMLInputElement>(null),
                useRef<HTMLInputElement>(null),
                useRef<HTMLInputElement>(null)
            ];

            useEffect(() => {
                // Controlla se l'utente è già autenticato
                const token = Cookies.get('authToken');
                if (token) {
                    // Recupera il tipo di dashboard dall'utente memorizzato
                    const userData = Cookies.get('userData');
                    if (userData) {
                        const user = JSON.parse(userData);
                        // Reindirizza alla dashboard appropriata in base ai privilegi
                        if (user.is_admin || user.is_super_admin) {
                            router.push('/admin/dashboard');
                        } else {
                            router.push('/dashboard');
                        }
                    } else {
                        router.push('/dashboard');
                    }
                    return;
                }

                const tel = searchParams.get('telefono');
                if (tel) {
                    setTelefono(tel);
                } else {
                    // Se non c'è il parametro telefono, reindirizza alla pagina di login
                    router.push('/login');
                }
            }, [searchParams, router]);

            const handleInputChange = (index: number, value: string) => {
                if (/^\d?$/.test(value)) {
                    const newCodeValues = [...codeValues];
                    newCodeValues[index] = value;
                    setCodeValues(newCodeValues);

                    // Passa automaticamente al campo successivo se è stato inserito un numero
                    if (value && index < 3) {
                        inputRefs[index + 1].current?.focus();
                    }
                }
            };

            const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
                // Gestione del tasto backspace
                if (e.key === 'Backspace' && !codeValues[index] && index > 0) {
                    inputRefs[index - 1].current?.focus();
                }
            };

            const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');

                const newCodeValues = [...codeValues];
                digits.forEach((digit, index) => {
                    if (index < 4) {
                        newCodeValues[index] = digit;
                    }
                });

                setCodeValues(newCodeValues);

                // Focus sull'ultimo input compilato o sul successivo vuoto
                const focusIndex = Math.min(digits.length, 3);
                inputRefs[focusIndex]?.current?.focus();
            };

            const handleVerify = async () => {
                setIsLoading(true);
                setError('');
                const code = codeValues.join('');

                try {
                    const response = await fetch('/api/auth/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({telefono, code}),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Errore durante la verifica');
                    }

                    // Memorizza i dati dell'utente e il token
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);

                    // Imposta i cookie per l'autenticazione persistente
                    // Scadenza impostata a 30 giorni, modifica secondo necessità
                    Cookies.set('authToken', data.token, {expires: 30, secure: true, sameSite: 'strict'});
                    Cookies.set('userData', JSON.stringify(data.user), {expires: 30, secure: true, sameSite: 'strict'});

                    // Reindirizza l'utente alla dashboard appropriata in base al tipo
                    if (data.dashboardType === 'admin') {
                        router.push('/admin/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error('Errore verifica:', error);
                    setError(error instanceof Error ? error.message : 'Errore durante la verifica');
                } finally {
                    setIsLoading(false);
                }
            };

            const handleResendCode = async () => {
                if (!telefono) return;

                setIsLoading(true);
                setError('');

                try {
                    const response = await fetch('/api/auth/send-code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({telefono}),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Errore durante l\'invio del codice');
                    }

                    alert('Codice inviato nuovamente');
                } catch (error) {
                    console.error('Errore invio codice:', error);
                    setError(error instanceof Error ? error.message : 'Errore durante l\'invio del codice');
                } finally {
                    setIsLoading(false);
                }
            };

            // Unisce il codice in un'unica stringa
            const completeCode = codeValues.join('');

            return (
                <div className="flex flex-col items-center justify-center min-h-screen w-full"
                     style={{backgroundColor: "#FA481B"}}>
                    {/* Freccia per tornare alla pagina precedente */}
                    <div className="absolute top-8 left-8">
                        <Link href="/login">
                            <div className="text-white text-3xl cursor-pointer">
                                &#8592;
                            </div>
                        </Link>
                    </div>

                    <div className="w-full max-w-xl px-6 py-8 flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-white mb-6">
                            Verifica account
                        </h1>
                        <p className="text-white text-lg mb-8 text-center">
                            Abbiamo inviato l'sms al numero indicato
                        </p>
                        <div className="w-full mb-8 px-8">
                            <div className="flex justify-between mt-4 mx-4">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        value={codeValues[index]}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-14 h-14 text-center text-2xl font-normal rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        style={{
                                            backgroundColor: "white",
                                            color: "#000",
                                        }}
                                        maxLength={1}
                                        inputMode="numeric"
                                        autoFocus={index === 0}
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-white bg-red-500 p-2 rounded mb-4 text-center w-full">
                                {error}
                            </p>
                        )}

                        <p className="mt-6 mb-6 text-center">
                            <span style={{color: "#656571"}}>Non hai ricevuto il codice?</span>{" "}
                            <span
                                className="text-white cursor-pointer"
                                onClick={handleResendCode}
                                style={{textDecoration: 'underline'}}
                            >
                                Invia di nuovo
                            </span>
                        </p>
                        <button
                            onClick={handleVerify}
                            className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                            disabled={completeCode.length !== 4 || isLoading}
                        >
                            {isLoading ? 'Verifica in corso...' : 'Verifica & Accedi'}
                        </button>
                    </div>
                </div>
            );
        }