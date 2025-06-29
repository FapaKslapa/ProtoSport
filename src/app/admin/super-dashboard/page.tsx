"use client";

import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import AdminCard from "@/components/AdminCard";
import AdminForm from "@/components/AdminForm";
import Alert from "@/components/Alert";
import OrarioCard from "@/components/OrarioCard";
import OrarioForm from "@/components/OrarioForm";
import ServizioCard from "@/components/ServizioCard";
import ServizioForm from "@/components/ServizioForm";
import PrenotazioniAdminModal from "@/components/PrenotazioniAdminModal";
import IcsLinksModal from "@/components/IcsLinksModal";
import Modal from "@/components/Modal";
import {FaUserCog} from "react-icons/fa";
import {Servizio, Orario, PrenotazioneAdmin, ModalState, Message} from "@/types/admin";
import DashboardNavbar from "@/components/DashboardNavbar";

interface Admin {
    id: number;
    nome: string;
    cognome: string;
    telefono: string;
}

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ nome: string; cognome: string } | null>(null);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
    const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fetchAdmins = useCallback(async () => {
        setIsLoadingAdmins(true);
        try {
            const res = await fetch("/api/auth/admin", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await res.json();
            if (res.ok && data.success) setAdmins(data.admins);
            else throw new Error(data.error || "Errore nel caricamento degli admin");
        } catch (e) {
            setAlertMsg({
                text: e instanceof Error ? e.message : "Errore durante il caricamento degli admin",
                type: "error"
            });
        } finally {
            setIsLoadingAdmins(false);
        }
    }, []);

    const handleSaveAdmin = async (adminData: { id?: number; nome: string; cognome: string; telefono: string }) => {
        try {
            const url = adminData.id
                ? `/api/auth/admin/${adminData.id}`
                : "/api/auth/admin/create";
            const method = adminData.id ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                },
                body: JSON.stringify(adminData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Errore durante il salvataggio dell'admin");
            setAlertMsg({text: `Admin ${adminData.id ? "aggiornato" : "creato"} con successo!`, type: "success"});
            setShowAdminModal(false);
            setEditingAdmin(null);
            fetchAdmins();
        } catch (e) {
            setAlertMsg({
                text: e instanceof Error ? e.message : "Errore durante il salvataggio dell'admin",
                type: "error"
            });
        }
    };

    const handleDeleteAdmin = async (id: number) => {
        if (!confirm("Sei sicuro di voler eliminare questo admin?")) return;
        setIsLoadingAction(true);
        try {
            const res = await fetch(`/api/auth/admin/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Errore durante l'eliminazione dell'admin");
            setAlertMsg({text: "Admin eliminato con successo!", type: "success"});
            fetchAdmins();
        } catch (e) {
            setAlertMsg({
                text: e instanceof Error ? e.message : "Errore durante l'eliminazione dell'admin",
                type: "error"
            });
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setEditingAdmin(admin);
        setShowAdminModal(true);
    };

    const handleAddAdmin = () => {
        setEditingAdmin(null);
        setShowAdminModal(true);
    };

    const handleCloseAdminModal = () => {
        setShowAdminModal(false);
        setEditingAdmin(null);
    };

    const fetchCalendarToken = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/calendar-token", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await res.json();
            if (data.success) setCalendarToken(data.token);
        } catch {
            setCalendarToken(null);
        }
    }, []);

    const fetchServizi = useCallback(async () => {
        setIsLoadingServizi(true);
        try {
            const response = await fetch("/api/servizi", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await response.json();
            if (data.success) setServizi(data.data);
        } finally {
            setIsLoadingServizi(false);
        }
    }, []);

    const fetchOrari = useCallback(async () => {
        try {
            const response = await fetch("/api/disponibilita", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await response.json();
            if (data.success) setOrari(data.data);
        } catch {
        }
    }, []);

    const fetchPrenotazioniAdmin = useCallback(async () => {
        setIsLoadingPrenotazioniAdmin(true);
        try {
            const res = await fetch("/api/prenotazioni", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
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
        const token = Cookies.get("adminAuthToken");
        if (!token) {
            router.push("/admin-login");
            return;
        }
        const userData = Cookies.get("adminUserData");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (!parsedUser.is_super_admin) {
                    router.push("/admin/dashboard");
                    return;
                }
                setUser(parsedUser);
                fetchAdmins();
            } catch {
                router.push("/admin-login");
            }
        }
        fetchServizi();
        fetchOrari();
        fetchCalendarToken();
        setIsLoading(false);
    }, [router, fetchAdmins, fetchServizi, fetchOrari, fetchCalendarToken]);

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

    useEffect(() => {
        if (alertMsg) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => setAlertMsg(null), 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [alertMsg]);

    const handleSaveServizio = async (servizio: Omit<Servizio, "id">) => {
        try {
            const response = await fetch("/api/servizi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                },
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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                },
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
            const response = await fetch(`/api/servizi/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
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
                const id = orari.find((o) => o.giorno_settimana === currentGiornoSettimana)?.id;
                if (id !== undefined) {
                    const response = await fetch(`/api/disponibilita/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                        },
                    });
                    const data = await response.json();
                    if (!data.success) {
                        setMessage({text: data.error || "Errore durante la modifica dell'orario", type: "error"});
                        return Promise.reject(new Error(data.error));
                    }
                }
            } else {
                const existing = orari.find((o) => o.giorno_settimana === orario.giorno_settimana);
                if (existing && existing.id !== undefined) {
                    const response = await fetch(`/api/disponibilita/${existing.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                        },
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
                    const response = await fetch("/api/disponibilita", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Cookies.get("adminAuthToken")}`,
                        },
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

    const handleLogout = () => {
        Cookies.remove("adminAuthToken");
        Cookies.remove("adminUserData");
        Cookies.remove("authToken");
        Cookies.remove("userData");
        router.push("/");
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
            <Alert
                message={alertMsg || message}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => {
                        setAlertMsg(null);
                        setMessage(null);
                    }, 400);
                }}
            />
            <DashboardNavbar onLogout={handleLogout}/>
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
                <div className="mb-8 w-full">
                    <div className="flex items-center mb-4 w-full max-w-5xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-800">Amministratori</h3>
                    </div>
                    {isLoadingAdmins ? (
                        <div className="flex justify-center my-8 w-full">
                            <div
                                className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : admins.length > 0 ? (
                        <div className="w-full flex justify-center">
                            <div className="flex overflow-x-auto pb-4 w-full max-w-full px-4 justify-start">
                                {admins.map((admin) => (
                                    <AdminCard
                                        key={admin.id}
                                        admin={admin}
                                        onDelete={handleDeleteAdmin}
                                        onEdit={handleEditAdmin}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 w-full flex flex-col items-center">
                            <p>Non ci sono amministratori registrati.</p>
                            <p className="mt-2">Aggiungi un nuovo amministratore per iniziare a gestire la
                                piattaforma.</p>
                        </div>
                    )}
                </div>
                <div className="mb-8 w-full">
                    <div className="flex items-center mb-4 w-full max-w-5xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-800">Servizi</h3>
                    </div>
                    {isLoadingServizi ? (
                        <div className="flex justify-center my-8 w-full">
                            <div
                                className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                        </div>
                    ) : servizi.length > 0 ? (
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
                    ) : (
                        <div className="text-center py-8 text-gray-500 w-full flex flex-col items-center">
                            <p>Nessun servizio disponibile.</p>
                            <p className="mt-2">Aggiungi un nuovo servizio per renderlo prenotabile dagli utenti.</p>
                        </div>
                    )}
                </div>
                <div className="mb-8 w-full">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 text-left">Orari Settimanali</h3>
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
            <Modal
                isOpen={showAdminModal}
                onClose={handleCloseAdminModal}
                title={editingAdmin ? "Modifica admin" : "Aggiungi un nuovo admin"}
                maxWidth="max-w-md"
                className="min-h-[70vh] max-h-[90vh]"
                showCloseButton
            >
                <AdminForm
                    admin={editingAdmin || undefined}
                    onSave={handleSaveAdmin}
                    onCancel={handleCloseAdminModal}
                />
            </Modal>
            <PrenotazioniAdminModal
                prenotazioni={prenotazioniAdmin}
                isOpen={modal.prenotazioni}
                onClose={() => setModal((m) => ({...m, prenotazioni: false}))}
            />
            {modal.nuovoServizio && (
                <ServizioForm
                    isOpen={modal.nuovoServizio}
                    onClose={() => setModal((m) => ({...m, nuovoServizio: false}))}
                    onSave={handleSaveServizio}
                />
            )}
            {modal.modificaServizio && currentServizio && (
                <ServizioForm
                    isOpen={modal.modificaServizio}
                    onClose={() => setModal((m) => ({...m, modificaServizio: false}))}
                    servizio={currentServizio}
                    onSave={handleUpdateServizio}
                />
            )}
            {modal.icsLinks && (
                <IcsLinksModal
                    icsUrl={icsUrl}
                    onClose={() => setModal((m) => ({...m, icsLinks: false}))}
                />
            )}
            {modal.modificaOrario && currentGiornoSettimana !== null && (
                <OrarioForm
                    isOpen={modal.modificaOrario}
                    onClose={() => {
                        setModal((m) => ({...m, modificaOrario: false}));
                        setCurrentGiornoSettimana(null);
                    }}
                    orario={orari.find((o) => o.giorno_settimana === currentGiornoSettimana)}
                    giornoSettimana={currentGiornoSettimana}
                    onSave={handleSaveOrario}
                />
            )}
            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 h-16 px-4 z-40">
                <div className="flex items-center justify-around h-full max-w-md mx-auto">
                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={handleAddAdmin}
                        aria-label="Gestione amministratori"
                    >
                        <FaUserCog className="h-6 w-6"/>
                        <span className="text-xs mt-1">Admin</span>
                    </button>
                    <button
                        className="text-gray-600 flex flex-col items-center justify-center"
                        onClick={() => setModal((m) => ({...m, nuovoServizio: true}))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        <span className="text-xs mt-1">Nuovo Servizio</span>
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
                </div>
            </nav>
        </div>
    );
}