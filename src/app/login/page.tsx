"use client";

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState("+39");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Controlla se l'utente è già autenticato
        const token = Cookies.get('authToken');
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Mantiene sempre il prefisso +39
        if (inputValue.startsWith("+39")) {
            setPhoneNumber(inputValue);
        } else {
            setPhoneNumber("+39" + inputValue.replace(/^\+39/, ""));
        }
    };

    const handleSendSMS = async () => {
        if (!phoneNumber || phoneNumber === "+39") {
            setError('Inserisci il tuo numero di telefono');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const telefono = phoneNumber; // Usiamo il numero completo con prefisso

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

            // Reindirizza alla pagina di verifica con il telefono come parametro
            router.push(`/verify?telefono=${encodeURIComponent(telefono)}`);
        } catch (error) {
            console.error('Errore invio codice:', error);
            setError(error instanceof Error ? error.message : 'Errore durante l\'invio del codice');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full"
             style={{backgroundColor: "#FA481B"}}>
            {/* Freccia per tornare alla home */}
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <div className="text-white text-3xl cursor-pointer">
                        &#8592;
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-xl px-6 py-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-white mb-6">
                    Verifica del tuo account
                </h1>
                <p className="text-white text-lg mb-8 text-center">
                    Ti manderemo un sms al tuo numero in modo da verificare se sei già attivo o se dobbiamo fare un
                    nuovo account
                </p>

                {error && (
                    <p className="text-white bg-red-500 p-2 rounded mb-4 text-center w-full">
                        {error}
                    </p>
                )}

                <div className="w-full mb-8">
                    <label
                        className="block mb-2 text-lg font-medium text-center"
                        style={{color: "#656571"}}
                    >
                        il tuo numero di telefono
                    </label>
                    <div className="w-3/5 mx-auto relative">
                        <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-2xl select-none"
                            style={{color: "#fff"}}
                        >
                            +39
                        </span>
                        <input
                            type="tel"
                            value={phoneNumber.replace(/^\+39/, "")}
                            onChange={handlePhoneChange}
                            className="w-full pl-20 pr-4 py-4 bg-transparent font-bold text-2xl border-0 border-b-2 focus:border-b-2 focus:outline-none"
                            style={{
                                borderRadius: 0,
                                color: "#fff",
                                borderBottom: "2px solid #656571"
                            }}
                            maxLength={10}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSendSMS}
                    className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                    disabled={isLoading}
                >
                    {isLoading ? 'Invio in corso...' : 'Invia SMS'}
                </button>
            </div>
        </div>
    );
}