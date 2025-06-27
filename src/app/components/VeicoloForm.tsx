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

    // Stati controllati, sempre coerenti con initialData
    const [marca, setMarca] = useState(initialData?.marca || "");
    const [modello, setModello] = useState(initialData?.modello || "");
    const [anno, setAnno] = useState(initialData?.anno ? initialData.anno.toString() : "");
    const [cilindrata, setCilindrata] = useState(initialData?.cilindrata ? initialData.cilindrata.toString() : "");
    const [targa, setTarga] = useState(initialData?.targa || "");

    // Aggiorna i campi quando cambia initialData (es. apertura modale modifica)
    useEffect(() => {
        setMarca(initialData?.marca || "");
        setModello(initialData?.modello || "");
        setAnno(initialData?.anno ? initialData.anno.toString() : "");
        setCilindrata(initialData?.cilindrata ? initialData.cilindrata.toString() : "");
        setTarga(initialData?.targa || "");
    }, [initialData]);

    const marche = Object.keys(catalogo).sort();
    const modelli = marca && catalogo[marca] ? Object.keys(catalogo[marca]).sort() : [];
    const anni = (marca && modello && catalogo[marca] && catalogo[marca][modello] && Array.isArray(catalogo[marca][modello].anni))
        ? catalogo[marca][modello].anni.slice().sort((a, b) => b - a)
        : [];
    const cilindrate = (marca && modello && catalogo[marca] && catalogo[marca][modello] && Array.isArray(catalogo[marca][modello].cilindrate))
        ? catalogo[marca][modello].cilindrate.slice().sort((a, b) => a - b)
        : [];

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

    // Reset dei campi dipendenti SOLO in creazione (non in modifica)
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
        // Controllo robusto per tipo
        const tipo = (marca && modello && catalogo[marca] && catalogo[marca][modello])
            ? catalogo[marca][modello].tipo
            : (initialData?.tipo || "");
        const veicolo = {
            ...initialData,
            marca,
            modello,
            anno: anno ? parseInt(anno) : null,
            tipo,
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
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto p-0 space-y-6"
        >
            {error && (
                <div className="p-3 mb-2 rounded-md bg-red-100 text-red-800 text-sm text-center">{error}</div>
            )}

            {/* Marca */}
            <div>
                <label htmlFor="marca" className="block text-sm font-bold text-gray-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                </label>
                <select
                    id="marca"
                    value={marca}
                    onChange={e => setMarca(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white shadow-sm transition-all duration-150 custom-select"
                    required
                >
                    <option value="">Seleziona una marca</option>
                    {marche.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Modello */}
            {marca && (
                <div>
                    <label htmlFor="modello" className="block text-sm font-bold text-gray-700 mb-1">
                        Modello <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="modello"
                        value={modello}
                        onChange={e => setModello(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white shadow-sm transition-all duration-150 custom-select"
                        required
                    >
                        <option value="">Seleziona un modello</option>
                        {modelli.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Anno */}
            {modello && (
                <div>
                    <label htmlFor="anno" className="block text-sm font-bold text-gray-700 mb-1">
                        Anno
                    </label>
                    <select
                        id="anno"
                        value={anno}
                        onChange={e => setAnno(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white shadow-sm transition-all duration-150 custom-select"
                    >
                        <option value="">Seleziona un anno</option>
                        {anni.map(a => (
                            <option key={a} value={a.toString()}>{a}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Cilindrata */}
            {anno && (
                <div>
                    <label htmlFor="cilindrata" className="block text-sm font-bold text-gray-700 mb-1">
                        Cilindrata
                    </label>
                    <select
                        id="cilindrata"
                        value={cilindrata}
                        onChange={e => setCilindrata(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white shadow-sm transition-all duration-150 custom-select"
                    >
                        <option value="">Seleziona una cilindrata</option>
                        {cilindrate.map(c => (
                            <option key={c} value={c.toString()}>{c} cc</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Targa */}
            {cilindrata && (
                <div>
                    <label htmlFor="targa" className="block text-sm font-bold text-gray-700 mb-1">
                        Targa <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="targa"
                        value={targa}
                        onChange={e => setTarga(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white uppercase shadow-sm transition-all duration-150"
                        placeholder="Es. AB123CD"
                        required
                        maxLength={10}
                    />
                </div>
            )}

            {/* Bottoni */}
            <div className="pt-2 flex gap-2">
                <button
                    type="submit"
                    className={`flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200${!targa ? " opacity-60 cursor-not-allowed" : ""}`}
                    disabled={!targa}
                >
                        <span className="inline-flex items-center justify-center">
                            Salva Veicolo
                        </span>
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl shadow transition-all duration-200"
                    >
                            <span className="inline-flex items-center justify-center">
                                Annulla
                            </span>
                    </button>
                )}
            </div>
            <style jsx global>{`
                /* Migliora il pannello delle select */
                select.custom-select {
                    background: #fff;
                    color: #222;
                    font-weight: 500;
                    border-radius: 0.75rem;
                    box-shadow: 0 2px 8px rgba(250, 72, 27, 0.06);
                    transition: border 0.2s, box-shadow 0.2s;
                }

                select.custom-select:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 2px #fee2e2;
                }

                select.custom-select option {
                    background: #fff;
                    color: #222;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                }

                select.custom-select option:checked, select.custom-select option:focus {
                    background: #fee2e2;
                    color: #b91c1c;
                }
            `}</style>
        </form>
    );
}