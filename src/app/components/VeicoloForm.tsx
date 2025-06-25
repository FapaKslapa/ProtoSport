"use client";

                import {useState, useEffect} from 'react';

                type VeicoloFormProps = {
                    onSave: (veicolo: any) => void;
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

                export default function VeicoloForm({onSave}: VeicoloFormProps) {
                    const [catalogo, setCatalogo] = useState<CatalogoData>({});
                    const [isLoading, setIsLoading] = useState(true);
                    const [error, setError] = useState<string | null>(null);

                    // Stati del form
                    const [marca, setMarca] = useState<string>('');
                    const [modello, setModello] = useState<string>('');
                    const [anno, setAnno] = useState<string>('');
                    const [cilindrata, setCilindrata] = useState<string>('');
                    const [targa, setTarga] = useState<string>('');

                    // Liste di opzioni basate sulla selezione corrente
                    const marche = Object.keys(catalogo).sort();
                    const modelli = marca ? Object.keys(catalogo[marca] || {}).sort() : [];
                    const anni = (marca && modello) ? catalogo[marca][modello]?.anni.sort((a, b) => b - a) : [];
                    const cilindrate = (marca && modello) ? catalogo[marca][modello]?.cilindrate.sort((a, b) => a - b) : [];

                    // Carica il catalogo
                    useEffect(() => {
                        const fetchCatalogo = async () => {
                            try {
                                setIsLoading(true);
                                const response = await fetch('/api/veicoli/catalogo');
                                const result = await response.json();

                                if (result.success) {
                                    setCatalogo(result.data);
                                } else {
                                    setError('Errore nel caricamento del catalogo');
                                }
                            } catch (err) {
                                setError('Errore di connessione');
                            } finally {
                                setIsLoading(false);
                            }
                        };

                        fetchCatalogo();
                    }, []);

                    // Reset dei campi quando cambia la marca
                    useEffect(() => {
                        setModello('');
                        setAnno('');
                        setCilindrata('');
                    }, [marca]);

                    // Reset dei campi quando cambia il modello
                    useEffect(() => {
                        setAnno('');
                        setCilindrata('');
                    }, [modello]);

                    // Reset della cilindrata quando cambia l'anno
                    useEffect(() => {
                        setCilindrata('');
                    }, [anno]);

                    const handleSubmit = (e: React.FormEvent) => {
                        e.preventDefault();

                        // Validazione base
                        if (!marca || !modello || !targa) {
                            setError('Compila tutti i campi obbligatori');
                            return;
                        }

                        // Prepara i dati da inviare
                        const veicolo = {
                            marca,
                            modello,
                            anno: anno ? parseInt(anno) : null,
                            tipo: marca && modello ? catalogo[marca][modello].tipo : '',
                            cilindrata: cilindrata ? parseInt(cilindrata) : null,
                            targa: targa.toUpperCase(),
                        };

                        // Invia i dati
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 mb-4 rounded-md bg-red-100 text-red-800">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">
                                    Marca *
                                </label>
                                <select
                                    id="marca"
                                    value={marca}
                                    onChange={(e) => setMarca(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                                    required
                                >
                                    <option value="">Seleziona una marca</option>
                                    {marche.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {marca && (
                                <div>
                                    <label htmlFor="modello" className="block text-sm font-medium text-gray-700 mb-1">
                                        Modello *
                                    </label>
                                    <select
                                        id="modello"
                                        value={modello}
                                        onChange={(e) => setModello(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                                        required
                                    >
                                        <option value="">Seleziona un modello</option>
                                        {modelli.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {modello && (
                                <div>
                                    <label htmlFor="anno" className="block text-sm font-medium text-gray-700 mb-1">
                                        Anno
                                    </label>
                                    <select
                                        id="anno"
                                        value={anno}
                                        onChange={(e) => setAnno(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                                    >
                                        <option value="">Seleziona un anno</option>
                                        {anni.map((a) => (
                                            <option key={a} value={a.toString()}>
                                                {a}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {anno && (
                                <div>
                                    <label htmlFor="cilindrata" className="block text-sm font-medium text-gray-700 mb-1">
                                        Cilindrata
                                    </label>
                                    <select
                                        id="cilindrata"
                                        value={cilindrata}
                                        onChange={(e) => setCilindrata(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                                    >
                                        <option value="">Seleziona una cilindrata</option>
                                        {cilindrate.map((c) => (
                                            <option key={c} value={c.toString()}>
                                                {c} cc
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {cilindrata && (
                                <div>
                                    <label htmlFor="targa" className="block text-sm font-medium text-gray-700 mb-1">
                                        Targa *
                                    </label>
                                    <input
                                        type="text"
                                        id="targa"
                                        value={targa}
                                        onChange={(e) => setTarga(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                                        placeholder="Es. AB123CD"
                                        required
                                    />
                                </div>
                            )}

                            {targa && (
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-lg"
                                    >
                                        Salva Veicolo
                                    </button>
                                </div>
                            )}
                        </form>
                    );
                }