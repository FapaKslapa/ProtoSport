"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import VeicoloForm from "@/components/VeicoloForm";
import VeicoloCard from "@/components/VeicoloCard";
import ServizioCard from "@/components/ServizioCardUser";
import PrenotazioneModal from "@/components/PrenotazioneModal";
import PrenotazioniUtenteModal from "@/components/PrenotazioneUtenteModal";
import StoricoPrenotazioniModal from "@/components/StoricoPrenotazioniModal";
import Alert from "@/components/Alert";
import {
    Veicolo,
    Servizio,
    PrenotazioneUtente,
    Message
} from "@/types/user";

export default function Dashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<Message | null>(null);
    const [showAlert, setShowAlert] = useState(false);

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

    const [showModal, setShowModal] = useState(false);
    const [veicoli, setVeicoli] = useState<Veicolo[]>([]);
    const [servizi, setServizi] = useState<Servizio[]>([]);
    const [isLoadingVeicoli, setIsLoadingVeicoli] = useState(true);
    const [isLoadingServizi, setIsLoadingServizi] = useState(true);

    const [showPrenotaModal, setShowPrenotaModal] = useState(false);
    const [selectedServizio, setSelectedServizio] = useState<number | null>(null);
    const [isPrenotazioneLoading, setIsPrenotazioneLoading] = useState(false);

    const [showPrenotazioni, setShowPrenotazioni] = useState(false);
    const [prenotazioni, setPrenotazioni] = useState<PrenotazioneUtente[]>([]);
    const [isLoadingPrenotazioni, setIsLoadingPrenotazioni] = useState(false);

    const [editVeicolo, setEditVeicolo] = useState<Veicolo | null>(null);
    const [deleteVeicoloId, setDeleteVeicoloId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showStorico, setShowStorico] = useState(false);
    const [storicoPrenotazioni, setStoricoPrenotazioni] = useState<PrenotazioneUtente[]>([]);
    const [isLoadingStorico, setIsLoadingStorico] = useState(false);

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchVeicoli();
        fetchServizi();
        setIsLoading(false);
    }, [router]);

    const fetchVeicoli = async () => {
        setIsLoadingVeicoli(true);
        try {
            const res = await fetch("/api/veicoli");
            const data = await res.json();
            if (data.success) setVeicoli(data.veicoli || data.data || []);
            else setMessage({text: data.error || data.message || "Errore nel caricamento dei veicoli", type: "error"});
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        } finally {
            setIsLoadingVeicoli(false);
        }
    };

    const fetchServizi = async () => {
        setIsLoadingServizi(true);
        try {
            const res = await fetch("/api/servizi");
            const data = await res.json();
            if (data.success) setServizi(data.data || data.servizi || []);
            else setMessage({text: data.error || "Errore nel caricamento dei servizi", type: "error"});
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        } finally {
            setIsLoadingServizi(false);
        }
    };

    const fetchPrenotazioni = async () => {
        setIsLoadingPrenotazioni(true);
        try {
            const res = await fetch("/api/prenotazioni");
            const data = await res.json();
            if (data.success) {
                const oggi = new Date();
                oggi.setHours(0, 0, 0, 0);
                const future = (data.data || []).filter((p: any) => {
                    const d = new Date(p.data_prenotazione);
                    d.setHours(0, 0, 0, 0);
                    return d >= oggi;
                }).sort((a: any, b: any) => {
                    if (a.data_prenotazione === b.data_prenotazione) {
                        return a.ora_inizio.localeCompare(b.ora_inizio);
                    }
                    return a.data_prenotazione.localeCompare(b.data_prenotazione);
                });
                setPrenotazioni(future.map((p: any) => ({
                    id: p.id,
                    servizio_nome: p.servizio_nome,
                    data_prenotazione: p.data_prenotazione,
                    ora_inizio: p.ora_inizio,
                    ora_fine: p.ora_fine,
                    stato: p.stato,
                    veicolo: `${p.marca} ${p.modello}`,
                    targa: p.targa
                })));
            }
        } finally {
            setIsLoadingPrenotazioni(false);
        }
    };

    const fetchStoricoPrenotazioni = async () => {
        setIsLoadingStorico(true);
        try {
            const res = await fetch("/api/prenotazioni");
            const data = await res.json();
            if (data.success) {
                const oggi = new Date();
                oggi.setHours(0, 0, 0, 0);
                const storico = (data.data || []).filter((p: any) => {
                    const d = new Date(p.data_prenotazione);
                    d.setHours(0, 0, 0, 0);
                    return d < oggi;
                }).sort((a: any, b: any) => {
                    if (a.data_prenotazione === b.data_prenotazione) {
                        return a.ora_inizio.localeCompare(b.ora_inizio);
                    }
                    return b.data_prenotazione.localeCompare(a.data_prenotazione);
                });
                setStoricoPrenotazioni(storico.map((p: any) => ({
                    id: p.id,
                    servizio_nome: p.servizio_nome,
                    data_prenotazione: p.data_prenotazione,
                    ora_inizio: p.ora_inizio,
                    ora_fine: p.ora_fine,
                    stato: p.stato,
                    veicolo: `${p.marca} ${p.modello}`,
                    targa: p.targa
                })));
            }
        } finally {
            setIsLoadingStorico(false);
        }
    };

    const handleSaveVeicolo = async (veicolo: Omit<Veicolo, "id">) => {
        try {
            const res = await fetch("/api/veicoli", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(veicolo),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({text: "Veicolo aggiunto con successo!", type: "success"});
                setShowModal(false);
                fetchVeicoli();
            } else {
                setMessage({text: data.error || data.message || "Errore durante il salvataggio", type: "error"});
            }
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        }
    };

    const handleEditVeicolo = (id: number) => {
        const v = veicoli.find(v => v.id === id);
        if (v) setEditVeicolo(v);
    };

    const handleUpdateVeicolo = async (veicolo: Veicolo) => {
        try {
            const res = await fetch(`/api/veicoli/${veicolo.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(veicolo),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({text: "Veicolo modificato con successo!", type: "success"});
                setEditVeicolo(null);
                fetchVeicoli();
            } else {
                setMessage({text: data.message || "Errore durante la modifica", type: "error"});
            }
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        }
    };

    const handleDeleteVeicolo = (id: number) => setDeleteVeicoloId(id);

    const confirmDeleteVeicolo = async () => {
        if (!deleteVeicoloId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/veicoli/${deleteVeicoloId}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            });
            const data = await res.json();
            if (data.success) {
                setMessage({text: "Veicolo eliminato con successo!", type: "success"});
                setDeleteVeicoloId(null);
                fetchVeicoli();
            } else {
                setMessage({text: data.message || "Errore durante l'eliminazione", type: "error"});
            }
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove("authToken");
        router.push("/");
    };

    const handlePrenotaServizio = (servizioId: number) => {
        setSelectedServizio(servizioId);
        setShowPrenotaModal(true);
    };

    const handleSavePrenotazione = async (prenotazione: {
        veicoloId: number;
        servizioId: number;
        data: string;
        ora: string;
    }) => {
        setIsPrenotazioneLoading(true);
        try {
            const res = await fetch("/api/prenotazioni", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(prenotazione),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({text: "Prenotazione effettuata con successo!", type: "success"});
                setShowPrenotaModal(false);
            } else {
                setMessage({text: data.error || "Errore durante la prenotazione", type: "error"});
            }
        } catch {
            setMessage({text: "Errore di connessione", type: "error"});
        } finally {
            setIsPrenotazioneLoading(false);
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
                    <button onClick={handleLogout}
                            className="text-white flex flex-col items-center justify-center ml-4">
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
                <h2 className="text-xl font-medium mb-4 text-black text-left">Garage</h2>
                {isLoadingVeicoli ? (
                    <div className="flex justify-center my-8 w-full">
                        <div
                            className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : veicoli.length > 0 ? (
                    <div className="w-full flex justify-center">
                        <div className="flex overflow-x-auto pb-4 w-full max-w-full px-4 justify-start">
                            {veicoli.map(veicolo => (
                                <VeicoloCard
                                    key={veicolo.id}
                                    veicolo={veicolo}
                                    onEdit={handleEditVeicolo}
                                    onDelete={handleDeleteVeicolo}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 w-full flex flex-col items-center">
                        <p>Non hai ancora aggiunto nessun veicolo.</p>
                        <p className="mt-2">Clicca sul pulsante + per aggiungerne uno.</p>
                    </div>
                )}

                <h2 className="text-xl font-medium mb-4 mt-8 text-black text-left">Servizi Disponibili</h2>
                {isLoadingServizi ? (
                    <div className="flex justify-center my-8 w-full">
                        <div
                            className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : servizi.length > 0 ? (
                    <div className="w-full flex justify-center">
                        <div className="flex overflow-x-auto pb-4 w-full max-w-full px-4 justify-start">
                            {servizi.map(servizio => (
                                <div
                                    key={servizio.id}
                                    onClick={() => handlePrenotaServizio(servizio.id)}
                                    className="cursor-pointer transition-transform transform hover:scale-[1.02] min-w-[320px] max-w-xs mr-4 last:mr-0 flex justify-center"
                                >
                                    <ServizioCard servizio={servizio}/>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 w-full flex flex-col items-center">
                        <p>Nessun servizio disponibile al momento.</p>
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
                        disabled={isLoadingVeicoli || isLoadingServizi}
                        onClick={() => {
                            fetchPrenotazioni();
                            setShowPrenotazioni(true);
                        }}
                        className="text-gray-600 flex flex-col items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="text-xs mt-1">Prenotazioni</span>
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
                    <button
                        onClick={() => {
                            fetchStoricoPrenotazioni();
                            setShowStorico(true);
                        }}
                        className="text-gray-600 flex flex-col items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="text-xs mt-1">Storico</span>
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
            </nav>

            {/* Modale aggiunta veicolo */}
            {showModal && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl bottom-0"
                        style={{
                            transition: "box-shadow 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 40px 0 rgba(0,0,0,0.25)"
                        }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Aggiungi un nuovo veicolo</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
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

            {/* Modale modifica veicolo */}
            {editVeicolo && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl bottom-0"
                        style={{
                            transition: "box-shadow 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 40px 0 rgba(0,0,0,0.25)"
                        }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Modifica veicolo</h2>
                            <button onClick={() => setEditVeicolo(null)} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <VeicoloForm
                            onSave={handleUpdateVeicolo}
                            initialData={editVeicolo}
                            onCancel={() => setEditVeicolo(null)}
                        />
                    </div>
                </div>
            )}

            {/* Popup conferma eliminazione */}
            {deleteVeicoloId && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-6 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl mb-0"
                        style={{
                            transition: "box-shadow 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 40px 0 rgba(0,0,0,0.10)"
                        }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-black">Elimina veicolo</h3>
                            <button onClick={() => setDeleteVeicoloId(null)}
                                    className="text-gray-400 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <p className="mb-4 text-gray-700 text-center">Sei sicuro di voler eliminare questo veicolo?</p>
                        <div className="flex justify-center gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                onClick={() => setDeleteVeicoloId(null)}
                                disabled={isDeleting}
                            >
                                Annulla
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                                onClick={confirmDeleteVeicolo}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminazione..." : "Elimina"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale prenotazione */}
            {showPrenotaModal && (
                <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white p-4 rounded-t-3xl w-full max-w-lg max-h-[95vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl bottom-0"
                        style={{
                            transition: "box-shadow 0.3s ease-out",
                            animation: "slideUp 0.3s ease-out",
                            boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 40px 0 rgba(0,0,0,0.25)"
                        }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Prenota Servizio</h2>
                            <button onClick={() => setShowPrenotaModal(false)}
                                    className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        {isPrenotazioneLoading ? (
                            <div className="flex justify-center py-10">
                                <div
                                    className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : (
                            <PrenotazioneModal
                                veicoli={veicoli}
                                servizi={servizi}
                                servizioPreselezionato={selectedServizio || undefined}
                                onSave={handleSavePrenotazione}
                                onCancel={() => setShowPrenotaModal(false)}
                                isLoading={isPrenotazioneLoading}
                            />
                        )}
                    </div>
                </div>
            )}

            <PrenotazioniUtenteModal
                prenotazioni={prenotazioni}
                isOpen={showPrenotazioni}
                onClose={() => setShowPrenotazioni(false)}
            />
            <StoricoPrenotazioniModal
                prenotazioni={storicoPrenotazioni}
                isOpen={showStorico}
                onClose={() => setShowStorico(false)}
                isLoading={isLoadingStorico}
            />
        </div>
    );
}