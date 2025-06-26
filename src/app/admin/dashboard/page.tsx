"use client";

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import OrarioCard from '@/app/components/OrarioCard';
import OrarioForm from '@/app/components/OrarioForm';
import ServizioCard from '@/app/components/ServizioCard';
import ServizioForm from '@/app/components/ServizioForm';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [servizi, setServizi] = useState<any[]>([]);
    const [orari, setOrari] = useState<any[]>([]);
    const [currentGiornoSettimana, setCurrentGiornoSettimana] = useState<number | null>(null);
    const [isLoadingServizi, setIsLoadingServizi] = useState(true);
    const [showOrariModal, setShowOrariModal] = useState(false);
    const [showServiziModal, setShowServiziModal] = useState(false);
    const [showPrenotazioniModal, setShowPrenotazioniModal] = useState(false);
    const [showNuovoServizioModal, setShowNuovoServizioModal] = useState(false);
    const [showModificaServizioModal, setShowModificaServizioModal] = useState(false);
    const [showModificaOrarioModal, setShowModificaOrarioModal] = useState(false);
    const [currentServizio, setCurrentServizio] = useState<any>(null);
    const [nuovoServizio, setNuovoServizio] = useState({
        nome: '',
        descrizione: '',
        durata_minuti: 60,
        prezzo: 0
    });

    const handleLogout = () => {
        Cookies.remove('authToken');
        Cookies.remove('userData');

        router.push('/');
    };
    useEffect(() => {
        const token = Cookies.get('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        // Recupera i dati dell'utente dal cookie
        const userDataCookie = Cookies.get('userData');
        if (userDataCookie) {
            try {
                const parsedUserData = JSON.parse(userDataCookie);
                setUserData(parsedUserData);
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
            }
        }

        fetchServizi();
        fetchOrari();

        setIsLoading(false);
    }, [router]);

    const fetchServizi = async () => {
        setIsLoadingServizi(true);
        try {
            const response = await fetch('/api/servizi');
            const data = await response.json();

            if (data.success) {
                setServizi(data.data);
            } else {
                console.error('Errore nel caricamento dei servizi:', data.error);
            }
        } catch (error) {
            console.error('Errore nella richiesta dei servizi:', error);
        } finally {
            setIsLoadingServizi(false);
        }
    };

    const fetchOrari = async () => {
        try {
            const response = await fetch('/api/disponibilita');
            const data = await response.json();

            if (data.success) {
                setOrari(data.data);
            } else {
                console.error('Errore nel caricamento degli orari:', data.error);
            }
        } catch (error) {
            console.error('Errore nella richiesta degli orari:', error);
        }
    };

    const handleSaveServizio = async (servizio: any) => {
        try {
            const response = await fetch('/api/servizi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(servizio),
            });

            const data = await response.json();

            if (data.success) {
                setShowNuovoServizioModal(false);
                fetchServizi();
                return Promise.resolve();
            } else {
                return Promise.reject(new Error(data.error));
            }
        } catch (error) {
            console.error('Errore nella richiesta:', error);
            return Promise.reject(error);
        }
    };

    const handleUpdateServizio = async (servizio: any) => {
        try {
            const response = await fetch(`/api/servizi/${servizio.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(servizio),
            });

            const data = await response.json();

            if (data.success) {
                setShowModificaServizioModal(false);
                fetchServizi();
                return Promise.resolve();
            } else {
                return Promise.reject(new Error(data.error));
            }
        } catch (error) {
            console.error('Errore nella richiesta:', error);
            return Promise.reject(error);
        }
    };

    const handleDeleteServizio = async (id: number) => {
        if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return;

        try {
            const response = await fetch(`/api/servizi/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchServizi();
            } else {
                alert('Errore nell\'eliminazione del servizio: ' + data.error);
            }
        } catch (error) {
            console.error('Errore nella richiesta:', error);
            alert('Errore di connessione');
        }
    };

    const handleSaveOrario = async (orario: any) => {
        try {
            // Se l'orario ha un ID, aggiorniamo l'orario esistente
            if (orario.id) {
                const response = await fetch(`/api/disponibilita/${orario.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        giorno_settimana: orario.giorno_settimana,
                        ora_inizio: orario.ora_inizio,
                        ora_fine: orario.ora_fine
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setShowModificaOrarioModal(false);
                    fetchOrari();
                    return Promise.resolve();
                } else {
                    return Promise.reject(new Error(data.error));
                }
            } else {
                const response = await fetch('/api/disponibilita', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        giorno_settimana: orario.giorno_settimana,
                        ora_inizio: orario.ora_inizio,
                        ora_fine: orario.ora_fine
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setShowModificaOrarioModal(false);
                    fetchOrari();
                    return Promise.resolve();
                } else {
                    return Promise.reject(new Error(data.error));
                }
            }
        } catch (error) {
            console.error('Errore nella richiesta:', error);
            return Promise.reject(error);
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
        <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
            <nav className="w-full py-4 px-6 shadow-md" style={{backgroundColor: "#FA481B"}}>
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

            <main className="flex-grow p-4 max-w-7xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Admin</h2>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Servizi</h3>
                    </div>

                    {isLoadingServizi ? (
                        <div className="flex justify-center my-8">
                            <div
                                className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto pb-4 w-full max-w-full -mx-4 px-4">
                            {servizi.map(servizio => (
                                <div className="flex-shrink-0 w-64 mr-4" key={servizio.id}>
                                    <ServizioCard
                                        servizio={servizio}
                                        onEdit={(servizio) => {
                                            setCurrentServizio(servizio);
                                            setShowModificaServizioModal(true);
                                        }}
                                        onDelete={handleDeleteServizio}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Orari Settimanali</h3>
                    <OrarioCard
                        orari={orari}
                        onEdit={(giorno) => {
                            setCurrentGiornoSettimana(giorno);
                            setShowModificaOrarioModal(true);
                        }}
                    />
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 h-16 px-4 z-40">
                <div className="flex items-center justify-around h-full max-w-md mx-auto">
                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={() => setShowNuovoServizioModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4v16m8-8H4"/>
                        </svg>
                        <span className="text-xs mt-1">Nuovo</span>
                    </button>

                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={() => setShowPrenotazioniModal(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="text-xs mt-1">Prenotazioni</span>
                    </button>

                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={handleLogout}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span className="text-xs mt-1">Logout</span>
                    </button>
                </div>
            </nav>
            {/* Modal servizi */}
            {showServiziModal && (
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
                            <h3 className="text-xl font-bold text-black">Gestione Servizi</h3>
                            <button onClick={() => setShowServiziModal(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <div className="text-black">
                            <p className="mb-4">Gestisci tutti i servizi offerti dall'officina.</p>
                            <button
                                onClick={() => {
                                    setShowServiziModal(false);
                                    setShowNuovoServizioModal(true);
                                }}
                                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 mb-4"
                            >
                                Aggiungi Nuovo Servizio
                            </button>
                            <div className="space-y-3">
                                {servizi.map(servizio => (
                                    <div key={servizio.id}
                                         className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold text-black">{servizio.nome}</h4>
                                            <p className="text-sm text-gray-600">{servizio.prezzo.toFixed(2)} €
                                                - {servizio.durata_minuti} min</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentServizio(servizio);
                                                    setShowServiziModal(false);
                                                    setShowModificaServizioModal(true);
                                                }}
                                                className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDeleteServizio(servizio.id);
                                                    setShowServiziModal(false);
                                                }}
                                                className="text-red-600 p-1 hover:bg-red-100 rounded-full"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal prenotazioni */}
            {showPrenotazioniModal && (
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
                            <h3 className="text-xl font-bold text-black">Prenotazioni</h3>
                            <button onClick={() => setShowPrenotazioniModal(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <div className="text-black">
                            <p className="mb-4">Visualizza e gestisci le prenotazioni dei clienti.</p>
                            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <p>Funzionalità in fase di implementazione</p>
                            </div>
                            <button
                                onClick={() => setShowPrenotazioniModal(false)}
                                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal nuovo servizio */}
            {showNuovoServizioModal && (
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
                            <h3 className="text-xl font-bold text-black">Nuovo Servizio</h3>
                            <button onClick={() => setShowNuovoServizioModal(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <ServizioForm
                            onSave={handleSaveServizio}
                            onCancel={() => setShowNuovoServizioModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal modifica servizio */}
            {showModificaServizioModal && currentServizio && (
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
                            <h3 className="text-xl font-bold text-black">Modifica Servizio</h3>
                            <button onClick={() => setShowModificaServizioModal(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <ServizioForm
                            servizio={currentServizio}
                            onSave={handleUpdateServizio}
                            onCancel={() => setShowModificaServizioModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal per modifica orario */}
            {showModificaOrarioModal && currentGiornoSettimana !== null && (
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
                            <h3 className="text-xl font-bold text-black">Modifica Orario</h3>
                            <button
                                onClick={() => {
                                    setShowModificaOrarioModal(false);
                                    setCurrentGiornoSettimana(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <OrarioForm
                            orario={orari.find(o => o.giorno_settimana === currentGiornoSettimana)}
                            giornoSettimana={currentGiornoSettimana}
                            onSave={handleSaveOrario}
                            onCancel={() => {
                                setShowModificaOrarioModal(false);
                                setCurrentGiornoSettimana(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}