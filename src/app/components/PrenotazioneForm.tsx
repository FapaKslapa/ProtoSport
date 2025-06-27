import {useState, useEffect} from "react";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {it} from "date-fns/locale/it";

registerLocale("it", it);

interface PrenotazioneFormProps {
    veicoli: any[];
    servizi: any[];
    servizioPreselezionato?: number;
    onSave: (prenotazione: any) => void;
    onCancel: () => void;
}

export default function PrenotazioneForm({
                                             veicoli,
                                             servizi,
                                             servizioPreselezionato,
                                             onSave,
                                             onCancel,
                                         }: PrenotazioneFormProps) {
    const [disponibilita, setDisponibilita] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        veicolo_id: veicoli[0]?.id || "",
        servizio_id: servizioPreselezionato || servizi[0]?.id || "",
        data_prenotazione: new Date(),
        ora_inizio: "",
        ora_fine: "",
        note: "",
    });

    useEffect(() => {
        const fetchDisponibilita = async () => {
            if (!formData.data_prenotazione) return;
            setIsLoading(true);
            try {
                const dateStr = formData.data_prenotazione.toISOString().split("T")[0];
                const res = await fetch(`/api/disponibilita?data=${dateStr}`);
                const data = await res.json();
                if (data.success) {
                    setDisponibilita(data.disponibilita || []);
                    setError("");
                } else {
                    setError(data.error || "Errore nel caricamento delle disponibilità");
                    setDisponibilita([]);
                }
            } catch {
                setError("Errore di connessione");
                setDisponibilita([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDisponibilita();
    }, [formData.data_prenotazione]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(f => ({...f, [name]: value}));
    };

    const handleDateChange = (date: Date | null) => {
        if (date) setFormData(f => ({...f, data_prenotazione: date, ora_inizio: "", ora_fine: ""}));
    };

    const handleFasciaOrariaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slot = disponibilita.find(d => d.id === parseInt(e.target.value));
        if (slot) setFormData(f => ({...f, ora_inizio: slot.ora_inizio, ora_fine: slot.ora_fine}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.veicolo_id || !formData.servizio_id || !formData.data_prenotazione || !formData.ora_inizio || !formData.ora_fine) {
            setError("Tutti i campi sono obbligatori");
            return;
        }
        const servizio = servizi.find(s => s.id === parseInt(formData.servizio_id));
        const veicolo = veicoli.find(v => v.id === parseInt(formData.veicolo_id));
        if (!servizio || !veicolo) {
            setError("Seleziona un servizio e un veicolo validi");
            return;
        }
        onSave({
            ...formData,
            data_prenotazione: formData.data_prenotazione.toISOString().split("T")[0],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-md bg-red-100 text-red-800">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veicolo</label>
                <select
                    name="veicolo_id"
                    value={formData.veicolo_id}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                >
                    <option value="">Seleziona un veicolo</option>
                    {veicoli.map(v => (
                        <option key={v.id} value={v.id}>
                            {v.marca} {v.modello} - {v.targa}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                <select
                    name="servizio_id"
                    value={formData.servizio_id}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    required
                >
                    <option value="">Seleziona un servizio</option>
                    {servizi.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.nome} - €{s.prezzo.toFixed(2)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <DatePicker
                    selected={formData.data_prenotazione}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    locale="it"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fascia Oraria</label>
                {isLoading ? (
                    <div className="flex justify-center py-2">
                        <div
                            className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
                    </div>
                ) : disponibilita.length > 0 ? (
                    <select
                        name="fascia_oraria"
                        onChange={handleFasciaOrariaChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        required
                        value={
                            formData.ora_inizio
                                ? disponibilita.find(d => d.ora_inizio === formData.ora_inizio)?.id || ""
                                : ""
                        }
                    >
                        <option value="">Seleziona un orario</option>
                        {disponibilita.map(slot => (
                            <option key={slot.id} value={slot.id}>
                                {slot.ora_inizio} - {slot.ora_fine}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="p-2 border border-gray-300 rounded-md text-gray-500 bg-gray-50">
                        Nessuna disponibilità per questa data
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (opzionale)</label>
                <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
            </div>

            <div className="flex space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                    Prenota
                </button>
            </div>
        </form>
    );
}