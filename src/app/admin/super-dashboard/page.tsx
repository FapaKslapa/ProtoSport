"use client";

import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import AdminCard from "@/components/AdminCard";
import AdminForm from "@/components/AdminForm";
import Alert from "@/components/Alert";

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
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fetchAdmins = useCallback(async () => {
        setIsLoadingAction(true);
        try {
            const res = await fetch("/api/auth/admin", {
                headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
            });
            const data = await res.json();
            if (res.ok && data.success) setAdmins(data.admins);
            else throw new Error(data.error || "Errore nel caricamento degli admin");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Errore durante il caricamento degli admin");
        } finally {
            setIsLoadingAction(false);
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
        setIsLoading(false);
    }, [router, fetchAdmins]);

    useEffect(() => {
        if (successMessage) {
            setAlertMsg({ text: successMessage, type: "success" });
        }
    }, [successMessage]);
    useEffect(() => {
        if (error) {
            setAlertMsg({ text: error, type: "error" });
        }
    }, [error]);
    useEffect(() => {
        if (alertMsg) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => {
                    setAlertMsg(null);
                    setError("");
                    setSuccessMessage("");
                }, 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [alertMsg]);

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
            setSuccessMessage(`Admin ${adminData.id ? "aggiornato" : "creato"} con successo!`);
            setShowModal(false);
            setEditingAdmin(null);
            fetchAdmins();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Errore durante il salvataggio dell'admin");
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
            setSuccessMessage("Admin eliminato con successo!");
            fetchAdmins();
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Errore durante l'eliminazione dell'admin");
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setEditingAdmin(admin);
        setShowModal(true);
    };

    const handleAddAdmin = () => {
        setEditingAdmin(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAdmin(null);
        setError("");
    };

    const handleLogout = () => {
        Cookies.remove("adminAuthToken");
        Cookies.remove("adminUserData");
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
        <div className="flex flex-col min-h-screen bg-white pb-16">
            <Alert
                message={alertMsg}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => {
                        setAlertMsg(null);
                        setError("");
                        setSuccessMessage("");
                    }, 400);
                }}
            />
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
                <div className="bg-white shadow-md rounded-lg p-4 mb-6 w-full max-w-2xl mx-auto text-center">
                    <h2 className="text-xl font-bold text-black">
                        Benvenuto, {user?.nome} {user?.cognome}
                    </h2>
                    <p className="text-black mt-1">
                        Gestisci gli amministratori del sistema da questa dashboard
                    </p>
                </div>


                {isLoadingAction ? (
                    <div className="flex justify-center my-8 w-full">
                        <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
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
                        <p>Non ci sono admin registrati.</p>
                        <p className="mt-2">Usa il pulsante + per aggiungere un nuovo amministratore.</p>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0" onClick={handleCloseModal}></div>
                    <div className="fixed inset-0 flex items-end justify-center pointer-events-none">
                        <div
                            className="bg-white p-6 rounded-3xl w-full max-w-md min-h-[70vh] max-h-[90vh] overflow-y-auto pointer-events-auto relative z-50"
                            style={{
                                transform: "translateY(0)",
                                transition: "transform 0.3s ease-out",
                                animation: "slideUp 0.3s ease-out",
                                boxShadow:
                                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.05)",
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">
                                    {editingAdmin ? "Modifica admin" : "Aggiungi un nuovo admin"}
                                </h2>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            <AdminForm
                                admin={editingAdmin || undefined}
                                onSave={handleSaveAdmin}
                                onCancel={handleCloseModal}
                            />
                        </div>
                    </div>
                </div>
            )}

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
                        onClick={handleAddAdmin}
                        className="bg-red-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg transform -translate-y-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                    <button onClick={handleLogout} className="text-gray-600 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span className="text-xs mt-1">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}