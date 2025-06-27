import React, {useState, useEffect} from "react";
import Alert from "@/components/Alert";
import {Servizio as ServizioType} from "@/types/admin";

type ServizioFormData = Omit<ServizioType, "id"> & { id?: number };

interface ServizioFormProps {
    servizio?: ServizioFormData;
    onSave: (servizio: ServizioType) => Promise<void>;
    onCancel: () => void;
}

const ServizioForm: React.FC<ServizioFormProps> = ({servizio, onSave, onCancel}) => {
    const [formData, setFormData] = useState<ServizioFormData>({
        nome: "",
        descrizione: "",
        durata_minuti: 60,
        prezzo: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (servizio) setFormData({...servizio});
    }, [servizio]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "prezzo"
                ? parseFloat(value) || 0
                : name === "durata_minuti"
                    ? parseInt(value) || 0
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!formData.nome.trim()) {
            setError("Il nome del servizio è obbligatorio");
            return;
        }
        setIsLoading(true);
        try {
            // Passa sempre un oggetto con id (se presente) e tutti i campi richiesti
            await onSave(formData as ServizioType);
        } catch (err: any) {
            setError(err?.message || "Si è verificato un errore");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-8 space-y-10"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                    <label className="text-gray-700 font-semibold text-base" htmlFor="nome">
                        Nome Servizio
                    </label>
                    <input
                        id="nome"
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition"
                        placeholder="Inserisci il nome"
                        disabled={isLoading}
                        autoFocus
                    />
                    <label className="text-gray-700 font-semibold text-base" htmlFor="durata_minuti">
                        Durata (minuti)
                    </label>
                    <input
                        id="durata_minuti"
                        type="number"
                        name="durata_minuti"
                        value={formData.durata_minuti}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition"
                        min="1"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <label className="text-gray-700 font-semibold text-base" htmlFor="descrizione">
                        Descrizione
                    </label>
                    <textarea
                        id="descrizione"
                        name="descrizione"
                        value={formData.descrizione}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition resize-none"
                        placeholder="Aggiungi una descrizione"
                        rows={5}
                        disabled={isLoading}
                    />
                    <label className="text-gray-700 font-semibold text-base" htmlFor="prezzo">
                        Prezzo (€)
                    </label>
                    <input
                        id="prezzo"
                        type="number"
                        name="prezzo"
                        value={formData.prezzo}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition"
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="pt-4 flex gap-4 justify-end">
                <button
                    type="submit"
                    className="py-4 px-8 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl font-bold shadow hover:from-red-600 hover:to-red-500 transition-all text-lg flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? "Salvataggio..." : servizio?.id ? "Aggiorna" : "Salva"}
                </button>
                <button
                    type="button"
                    className="py-4 px-8 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-lg"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Annulla
                </button>
            </div>
        </form>
    );
};

export default ServizioForm;