"use client";

import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import OrarioCard from "@/components/OrarioCard";
import OrarioForm from "@/components/OrarioForm";
import ServizioCard from "@/components/ServizioCard";
import ServizioForm from "@/components/ServizioForm";
import PrenotazioniAdminModal from "@/components/PrenotazioniAdminModal";
import Alert from "@/components/Alert";
import IcsLinksModal from "@/components/IcsLinksModal";
import {
    Servizio,
    Orario,
    PrenotazioneAdmin,
    ModalState,
    Message
} from "@/types/admin";

export default function AdminDashboard() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
    const [servizi, setServizi] = useState<Servizio[]>([]);
    const [orari, setOrari] = useState<Orario[]>([]);
    const [prenotazioniAdmin, setPrenotazioniAdmin] = useState<PrenotazioneAdmin[]>([]);
    const [calendarToken, setCalendarToken] = useState<string | null>(null);

    const [modal, setModal] = useState<ModalState>({
        servizi: false,
        nuovoServizio: false,
        modificaServizio: false,
        modificaOrario: false,
        prenotazioni: false,
        icsLinks: false,
    });

    const [isLoadingServizi, setIsLoadingServizi] = useState(true);
    const [isLoadingPrenotazioniAdmin, setIsLoadingPrenotazioniAdmin] = useState(false);

    const [currentServizio, setCurrentServizio] = useState<Servizio | null>(null);
    const [currentGiornoSettimana, setCurrentGiornoSettimana] = useState<number | null>(null);

    const [message, setMessage] = useState<Message | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    const handleLogout = () => {
        Cookies.remove("authToken");
        Cookies.remove("userData");
        router.push("/");
    };

    const fetchCalendarToken = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/calendar-token");
            const data = await res.json();
            if (data.success) setCalendarToken(data.token);
        } catch {
            setCalendarToken(null);
        }
    }, []);

    const fetchServizi = useCallback(async () => {
        setIsLoadingServizi(true);
        try {
            const response = await fetch("/api/servizi");
            const data = await response.json();
            if (data.success) setServizi(data.data);
        } finally {
            setIsLoadingServizi(false);
        }
    }, []);

    const fetchOrari = useCallback(async () => {
        try {
            const response = await fetch("/api/disponibilita");
            const data = await response.json();
            if (data.success) setOrari(data.data);
        } catch {
        }
    }, []);

    const fetchPrenotazioniAdmin = useCallback(async () => {
        setIsLoadingPrenotazioniAdmin(true);
        try {
            const res = await fetch("/api/prenotazioni");
            const data = await res.json();
            if (data.success) {
                setPrenotazioniAdmin(
                    (data.data || []).map((p: any) => ({
                        id: p.id,
                        user_nome: p.user_nome,
                        user_cognome: p.user_cognome,
                        servizio_nome: p.servizio_nome,
                        data_prenotazione: p.data_prenotazione,
                        ora_inizio: p.ora_inizio,
                        ora_fine: p.ora_fine,
                        stato: p.stato,
                        veicolo: `${p.marca} ${p.modello}`,
                        targa: p.targa,
                    }))
                );
            }
        } finally {
            setIsLoadingPrenotazioniAdmin(false);
        }
    }, []);

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (!token) {
            router.push("/login");
            return;
        }
        const userDataCookie = Cookies.get("userData");
        if (userDataCookie) {
            try {
                setUserData(JSON.parse(userDataCookie));
            } catch {
            }
        }
        fetchServizi();
        fetchOrari();
        fetchCalendarToken();
        setIsLoading(false);
    }, [router, fetchServizi, fetchOrari, fetchCalendarToken]);

    useEffect(() => {
        if (message) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => setMessage(null), 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSaveServizio = async (servizio: Omit<Servizio, "id">) => {
        try {
            const response = await fetch("/api/servizi", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(servizio),
            });
            const data = await response.json();
            if (data.success) {
                setModal((m) => ({...m, nuovoServizio: false}));
                fetchServizi();
                setMessage({text: "Servizio aggiunto con successo!", type: "success"});
                return Promise.resolve();
            }
            setMessage({text: data.error || "Errore durante il salvataggio", type: "error"});
            return Promise.reject(new Error(data.error));
        } catch (error) {
            setMessage({text: "Errore di connessione", type: "error"});
            return Promise.reject(error);
        }
    };

    const handleUpdateServizio = async (servizio: Servizio) => {
        try {
            const response = await fetch(`/api/servizi/${servizio.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(servizio),
            });
            const data = await response.json();
            if (data.success) {
                setModal((m) => ({...m, modificaServizio: false}));
                fetchServizi();
                setMessage({text: "Servizio modificato con successo!", type: "success"});
                return Promise.resolve();
            }
            setMessage({text: data.error || "Errore durante la modifica", type: "error"});
            return Promise.reject(new Error(data.error));
        } catch (error) {
            setMessage({text: "Errore di connessione", type: "error"});
            return Promise.reject(error);
        }
    };

    const handleDeleteServizio = async (id: number) => {
        if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;
        try {
            const response = await fetch(`/api/servizi/${id}`, {method: "DELETE"});
            const data = await response.json();
            if (data.success) {
                fetchServizi();
                setMessage({text: "Servizio eliminato con successo!", type: "success"});
            } else {
                setMessage({text: "Errore nell'eliminazione del servizio: " + data.error, type: "error"});
            }
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        }
    };

    const handleSaveOrario = async (orario?: Omit<Orario, "is_closed">) => {
        try {
            if (!orario) {
                // Cancellazione orario per il giorno corrente
                const id = orari.find((o) => o.giorno_settimana === currentGiornoSettimana)?.id;
                if (id !== undefined) {
                    const response = await fetch(`/api/disponibilita/${id}`, {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json"},
                    });
                    const data = await response.json();
                    if (!data.success) {
                        setMessage({text: data.error || "Errore durante la modifica dell'orario", type: "error"});
                        return Promise.reject(new Error(data.error));
                    }
                }
            } else {
                // Aggiornamento o creazione
                const existing = orari.find((o) => o.giorno_settimana === orario.giorno_settimana);
                if (existing && existing.id !== undefined) {
                    // Update
                    const response = await fetch(`/api/disponibilita/${existing.id}`, {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            giorno_settimana: orario.giorno_settimana,
                            ora_inizio: orario.ora_inizio,
                            ora_fine: orario.ora_fine,
                        }),
                    });
                    const data = await response.json();
                    if (!data.success) {
                        setMessage({text: data.error || "Errore durante la modifica dell'orario", type: "error"});
                        return Promise.reject(new Error(data.error));
                    }
                } else {
                    // Create
                    const response = await fetch("/api/disponibilita", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            giorno_settimana: orario.giorno_settimana,
                            ora_inizio: orario.ora_inizio,
                            ora_fine: orario.ora_fine,
                        }),
                    });
                    const data = await response.json();
                    if (!data.success) {
                        setMessage({text: data.error || "Errore durante la modifica dell'orario", type: "error"});
                        return Promise.reject(new Error(data.error));
                    }
                }
            }
            await fetchOrari();
            setModal((m) => ({...m, modificaOrario: false}));
            setCurrentGiornoSettimana(null);
            return Promise.resolve();
        } catch (error: any) {
            setMessage({text: error?.message || error?.error || "Si è verificato un errore", type: "error"});
            return Promise.reject(error);
        }
    };
    const icsUrl = calendarToken
        ? `/api/admin/calendar?token=${calendarToken}`
        : "/api/admin/calendar";

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
            <Alert
                message={message}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => setMessage(null), 400);
                }}
            />

            <nav className="w-full py-4 px-6 relative" style={{backgroundColor: "#FA481B"}}>
                <div className="flex justify-between items-center">
                    <div className="flex-1 flex justify-center">
                        <Image
                            src="/Logo Compresso.png"
                            alt="Logo"
                            width={180}
                            height={60}
                            className="object-contain filter invert brightness-0"
                            priority
                        />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-white flex flex-col items-center justify-center ml-4"
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

            <main
                className="flex-grow mx-auto w-full"
                style={{
                    paddingLeft: "4vw",
                    paddingRight: "4vw",
                    paddingTop: "24px",
                    paddingBottom: "16px",
                    maxWidth: "100vw"
                }}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Dashboard Admin</h2>

                <div className="mb-8 w-full">
                    <div className="flex justify-between items-center mb-4 w-full max-w-5xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-800">Servizi</h3>
                    </div>
                    {isLoadingServizi ? (
                        <div className="flex justify-center my-8 w-full">
                            <div
                                className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <div
                                className="flex overflow-x-auto pb-4 w-full max-w-full px-4 items-stretch justify-start">
                                {servizi.map((servizio) => (
                                    <div
                                        className="flex-shrink-0 min-w-[320px] max-w-xs w-full mr-4 h-full flex justify-center"
                                        key={servizio.id}>
                                        <ServizioCard
                                            servizio={servizio}
                                            onEdit={(s) => {
                                                setCurrentServizio(s);
                                                setModal((m) => ({...m, modificaServizio: true}));
                                            }}
                                            onDelete={handleDeleteServizio}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-8 w-full">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Orari Settimanali</h3>
                    <div className="w-full flex justify-center">
                        <OrarioCard
                            orari={orari}
                            onEdit={(giorno) => {
                                setCurrentGiornoSettimana(giorno);
                                setModal((m) => ({...m, modificaOrario: true}));
                            }}
                        />
                    </div>
                </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 h-16 px-4 z-40">
                <div className="flex items-center justify-around h-full max-w-md mx-auto">
                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={() => setModal((m) => ({...m, nuovoServizio: true}))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        <span className="text-xs mt-1">Nuovo</span>
                    </button>

                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={() => {
                            fetchPrenotazioniAdmin();
                            setModal((m) => ({...m, prenotazioni: true}));
                        }}
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
                        onClick={() => setModal((m) => ({...m, icsLinks: !m.icsLinks}))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2}/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M16 2v4M8 2v4M3 10h18"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10.5 17a2.5 2.5 0 003.5 0l2-2a2.5 2.5 0 00-3.5-3.5l-.5.5"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M13.5 13a2.5 2.5 0 00-3.5 0l-2 2a2.5 2.5 0 003.5 3.5l.5-.5"/>
                        </svg>
                        <span className="text-xs mt-1">Connetti</span>
                    </button>
                    <button className="text-gray-600 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.01c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.01 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.01 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.01c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 00-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.01-2.572c-.94-1.543.827-3.31 2.37-2.37.996.608 2.29.07 2.572-1.01z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span className="text-xs mt-1">Impostazioni</span>
                    </button>
                    <button className="text-gray-600 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4"/>
                        </svg>
                        <span className="text-xs mt-1">Profilo</span>
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-50">
                    {modal.icsLinks && (
                        <IcsLinksModal
                            icsUrl={icsUrl}
                            onClose={() => setModal((m) => ({...m, icsLinks: false}))}
                        />
                    )}
                </div>
            </nav>

            {modal.servizi && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-3xl w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto pointer-events-auto"
                        style={{
                            transform: "translateY(0)",
                            transition: "transform 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-black">Gestione Servizi</h3>
                            <button
                                onClick={() => setModal((m) => ({...m, servizi: false}))}
                                className="text-gray-500 hover:text-gray-700"
                            >
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
                                onClick={() => setModal((m) => ({...m, servizi: false, nuovoServizio: true}))}
                                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 mb-4"
                            >
                                Aggiungi Nuovo Servizio
                            </button>
                            <div className="space-y-3">
                                {servizi.map((servizio) => (
                                    <div key={servizio.id}
                                         className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold text-black">{servizio.nome}</h4>
                                            <p className="text-sm text-gray-600">
                                                {servizio.prezzo.toFixed(2)} € - {servizio.durata_minuti} min
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentServizio(servizio);
                                                    setModal((m) => ({...m, servizi: false, modificaServizio: true}));
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
                                                    setModal((m) => ({...m, servizi: false}));
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

            <PrenotazioniAdminModal
                prenotazioni={prenotazioniAdmin}
                isOpen={modal.prenotazioni}
                onClose={() => setModal((m) => ({...m, prenotazioni: false}))}
            />

            {modal.nuovoServizio && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-auto">
                    <div
                        className="bg-white p-0 rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col slide-up"
                        style={{
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <div
                            className="sticky top-0 bg-white z-20 flex justify-between items-center px-8 py-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-black">Nuovo Servizio</h3>
                            <button
                                onClick={() => setModal((m) => ({...m, nuovoServizio: false}))}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Chiudi"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col px-2 py-6">
                            <ServizioForm
                                onSave={handleSaveServizio}
                                onCancel={() => setModal((m) => ({...m, nuovoServizio: false}))}
                            />
                        </div>
                    </div>
                </div>
            )}

            {modal.modificaServizio && currentServizio && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-3xl w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto pointer-events-auto"
                        style={{
                            transform: "translateY(0)",
                            transition: "transform 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-black">Modifica Servizio</h3>
                            <button
                                onClick={() => setModal((m) => ({...m, modificaServizio: false}))}
                                className="text-gray-500 hover:text-gray-700"
                            >
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
                            onCancel={() => setModal((m) => ({...m, modificaServizio: false}))}
                        />
                    </div>
                </div>
            )}

            {modal.modificaOrario && currentGiornoSettimana !== null && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-3xl w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto pointer-events-auto"
                        style={{
                            transform: "translateY(0)",
                            transition: "transform 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-black">Modifica Orario</h3>
                            <button
                                onClick={() => {
                                    setModal((m) => ({...m, modificaOrario: false}));
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
                            orario={orari.find((o) => o.giorno_settimana === currentGiornoSettimana)}
                            giornoSettimana={currentGiornoSettimana}
                            onSave={handleSaveOrario}
                            onCancel={() => {
                                setModal((m) => ({...m, modificaOrario: false}));
                                setCurrentGiornoSettimana(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}