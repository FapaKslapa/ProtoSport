"use client";

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import VeicoloForm from '@/app/components/VeicoloForm';
import VeicoloCard from '@/app/components/VeicoloCard';

export default function Dashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [veicoli, setVeicoli] = useState<any[]>([]);
    const [isLoadingVeicoli, setIsLoadingVeicoli] = useState(true);

    const fetchVeicoli = async () => {
        try {
            setIsLoadingVeicoli(true);
            const response = await fetch('/api/veicoli');
            const data = await response.json();

            if (data.success) {
                setVeicoli(data.veicoli);
            } else {
                setMessage({text: data.message || 'Errore nel caricamento dei veicoli', type: 'error'});
            }
        } catch (error) {
            setMessage({text: 'Errore di connessione', type: 'error'});
        } finally {
            setIsLoadingVeicoli(false);
        }
    };

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchVeicoli();
        setIsLoading(false);
    }, [router]);

    const handleSaveVeicolo = async (veicolo: any) => {
        try {
            const response = await fetch('/api/veicoli', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(veicolo),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({text: 'Veicolo aggiunto con successo!', type: 'success'});
                setShowModal(false);
                fetchVeicoli();
            } else {
                setMessage({text: data.message || 'Errore durante il salvataggio', type: 'error'});
            }
        } catch (error) {
            setMessage({text: 'Errore di connessione', type: 'error'});
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white pb-16">
            <nav className="w-full py-4 px-6" style={{backgroundColor: "#FA481B"}}>
                <div className="flex justify-center items-center">
                    <Image
                        src="/Logo Compresso.png"
                        alt="Logo"
                        width={180}
                        height={60}
                        className="object-contain filter brightness-0 invert"
                        priority
                    />
                </div>
            </nav>

            <main className="flex-grow p-4 max-w-full mx-auto">
                {message && (
                    <div
                        className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <h2 className="text-xl font-medium mb-4 text-black">Garage</h2>

                {isLoadingVeicoli ? (
                    <div className="flex justify-center my-8">
                        <div
                            className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : veicoli.length > 0 ? (
                    <div className="flex overflow-x-auto pb-4 w-full max-w-full -mx-4 px-4">
                        {veicoli.map((veicolo) => (
                            <VeicoloCard key={veicolo.id} veicolo={veicolo}/>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Non hai ancora aggiunto nessun veicolo.</p>
                        <p className="mt-2">Clicca sul pulsante + per aggiungerne uno.</p>
                    </div>
                )}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 h-16 px-4 z-40">
                <div className="flex items-center justify-around h-full max-w-md mx-auto">
                    <button className="text-gray-600 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span className="text-xs mt-1">Home</span>
                    </button>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-red-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg transform -translate-y-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>

                    <button className="text-gray-600 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span className="text-xs mt-1">Profilo</span>
                    </button>
                </div>
            </nav>

            {showModal && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-3xl w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto pointer-events-auto"
                        style={{
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease-out',
                            animation: 'slideUp 0.3s ease-out',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Aggiungi un nuovo veicolo</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <VeicoloForm onSave={handleSaveVeicolo}/>
                    </div>
                </div>
            )}
        </div>
    );
}