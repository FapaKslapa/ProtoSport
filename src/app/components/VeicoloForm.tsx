"use client";
import {useState, useEffect} from "react";

type VeicoloFormProps = {
    onSave: (veicolo: any) => void;
    initialData?: any;
    onCancel?: () => void;
};

type CatalogoData = {
    [marca: string]: {
        [modello: string]: {
            anni: number[];
            tipo: string;
            cilindrate: number[];
        };
    };
};

export default function VeicoloForm({onSave, initialData, onCancel}: VeicoloFormProps) {
    const [catalogo, setCatalogo] = useState<CatalogoData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [marca, setMarca] = useState(initialData?.marca || "");
    const [modello, setModello] = useState(initialData?.modello || "");
    const [anno, setAnno] = useState(initialData?.anno ? initialData.anno.toString() : "");
    const [cilindrata, setCilindrata] = useState(initialData?.cilindrata ? initialData.cilindrata.toString() : "");
    const [targa, setTarga] = useState(initialData?.targa || "");

    const marche = Object.keys(catalogo).sort();
    const modelli = marca ? Object.keys(catalogo[marca] || {}).sort() : [];
    const anni = marca && modello ? catalogo[marca][modello]?.anni.slice().sort((a, b) => b - a) : [];
    const cilindrate = marca && modello ? catalogo[marca][modello]?.cilindrate.slice().sort((a, b) => a - b) : [];

    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/veicoli/catalogo");
                const result = await response.json();
                if (result.success) setCatalogo(result.data);
                else setError("Errore nel caricamento del catalogo");
            } catch {
                setError("Errore di connessione");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCatalogo();
    }, []);

    useEffect(() => {
        if (!initialData) {
            setModello("");
            setAnno("");
            setCilindrata("");
            setTarga("");
        }
    }, [marca]);

    useEffect(() => {
        if (!initialData) {
            setAnno("");
            setCilindrata("");
            setTarga("");
        }
    }, [modello]);

    useEffect(() => {
        if (!initialData) {
            setCilindrata("");
            setTarga("");
        }
    }, [anno]);

    useEffect(() => {
        if (!initialData) setTarga("");
    }, [cilindrata]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!marca || !modello || !targa) {
            setError("Compila tutti i campi obbligatori");
            return;
        }
        const veicolo = {
            ...initialData,
            marca,
            modello,
            anno: anno ? parseInt(anno) : null,
            tipo: marca && modello ? catalogo[marca][modello].tipo : "",
            cilindrata: cilindrata ? parseInt(cilindrata) : null,
            targa: targa.toUpperCase(),
        };
        onSave(veicolo);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 mb-2 rounded-md bg-red-100 text-red-800 text-sm text-center">{error}</div>
            )}
            <div>
                <label htmlFor="marca" className="block text-sm font-semibold text-gray-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                </label>
                <select
                    id="marca"
                    value={marca}
                    onChange={e => setMarca(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
                    required
                >
                    <option value="">Seleziona una marca</option>
                    {marche.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>
            {marca && (
                <div>
                    <label htmlFor="modello" className="block text-sm font-semibold text-gray-700 mb-1">
                        Modello <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="modello"
                        value={modello}
                        onChange={e => setModello(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
                        required
                    >
                        <option value="">Seleziona un modello</option>
                        {modelli.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            )}
            {modello && (
                <div>
                    <label htmlFor="anno" className="block text-sm font-semibold text-gray-700 mb-1">
                        Anno
                    </label>
                    <select
                        id="anno"
                        value={anno}
                        onChange={e => setAnno(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
                    >
                        <option value="">Seleziona un anno</option>
                        {anni.map(a => (
                            <option key={a} value={a.toString()}>{a}</option>
                        ))}
                    </select>
                </div>
            )}
            {anno && (
                <div>
                    <label htmlFor="cilindrata" className="block text-sm font-semibold text-gray-700 mb-1">
                        Cilindrata
                    </label>
                    <select
                        id="cilindrata"
                        value={cilindrata}
                        onChange={e => setCilindrata(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
                    >
                        <option value="">Seleziona una cilindrata</option>
                        {cilindrate.map(c => (
                            <option key={c} value={c.toString()}>{c} cc</option>
                        ))}
                    </select>
                </div>
            )}
            {cilindrata && (
                <div>
                    <label htmlFor="targa" className="block text-sm font-semibold text-gray-700 mb-1">
                        Targa <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="targa"
                        value={targa}
                        onChange={e => setTarga(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white uppercase"
                        placeholder="Es. AB123CD"
                        required
                        maxLength={10}
                    />
                </div>
            )}
            <div className="pt-2 flex gap-2">
                <button
                    type="submit"
                    className={`flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-200${!targa ? " opacity-60 cursor-not-allowed" : ""}`}
                    disabled={!targa}
                >
                    Salva Veicolo
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg shadow transition-colors duration-200"
                    >
                        Annulla
                    </button>
                )}
            </div>
        </form>
    );
}