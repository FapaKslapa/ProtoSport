import React, {useState, useEffect} from "react";
import Alert from "@/components/Alert";

interface AdminFormProps {
    admin?: { id: number; nome: string; cognome: string; telefono: string };
    onSave: (admin: { id?: number; nome: string; cognome: string; telefono: string }) => Promise<void>;
    onCancel: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({admin, onSave, onCancel}) => {
    const [formData, setFormData] = useState({nome: "", cognome: "", telefono: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (admin) {
            const tel = admin.telefono.replace(/^\+39\s?/, "");
            setFormData({nome: admin.nome, cognome: admin.cognome, telefono: tel});
        }
    }, [admin]);

    useEffect(() => {
        if (error) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => setError(""), 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name === "telefono") {
            // Solo numeri, max 10 cifre
            const cleaned = value.replace(/\D/g, "").slice(0, 10);
            setFormData((prev) => ({...prev, telefono: cleaned}));
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!formData.nome.trim()) return setError("Il nome è obbligatorio");
        if (!formData.cognome.trim()) return setError("Il cognome è obbligatorio");
        if (!formData.telefono.trim() || formData.telefono.length < 9)
            return setError("Il numero di telefono è obbligatorio e deve essere valido");
        setIsLoading(true);
        try {
            const telefono = "+39" + formData.telefono;
            await onSave(admin ? {...formData, id: admin.id, telefono} : {...formData, telefono});
        } catch (err) {
            setError(err instanceof Error ? err.message : "Si è verificato un errore");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto flex flex-col gap-4 relative"
            style={{minWidth: 320}}
        >
            <Alert
                message={error ? {text: error, type: "error"} : null}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => setError(""), 400);
                }}
            />
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-base font-bold text-black mb-2">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-black text-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                        disabled={isLoading}
                        placeholder="Inserisci il nome"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold text-black mb-2">Cognome</label>
                    <input
                        type="text"
                        name="cognome"
                        value={formData.cognome}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-black text-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                        disabled={isLoading}
                        placeholder="Inserisci il cognome"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="block text-base font-bold text-black mb-2">Numero di telefono</label>
                    <div
                        className="flex items-center bg-gray-50 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-red-400 transition">
                        <span className="px-3 text-lg text-gray-500 select-none">+39</span>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="flex-1 px-2 py-3 bg-transparent text-black text-lg border-0 focus:ring-0 outline-none"
                            disabled={isLoading}
                            placeholder="1234567890"
                            autoComplete="off"
                            inputMode="numeric"
                            pattern="[0-9]{9,10}"
                        />
                    </div>
                </div>
            </div>
            <div
                className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 py-4 px-4 flex justify-between max-w-md mx-auto"
                style={{boxShadow: "0 -2px 8px rgba(0,0,0,0.04)"}}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    className="py-3 px-8 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-lg"
                    disabled={isLoading}
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="py-3 px-8 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl font-bold shadow hover:from-red-600 hover:to-red-500 transition-all text-lg flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading && (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    )}
                    {isLoading ? "Salvataggio..." : admin ? "Aggiorna" : "Crea"}
                </button>
            </div>
        </form>
    );
};

export default AdminForm;