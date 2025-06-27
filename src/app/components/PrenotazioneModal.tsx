import React, {useState, useEffect} from "react";
import VeicoloCardMini from "./VeicoloCardMini";
import CardServizioMini from "./CardServizioMini";
import CalendarElegant from "./CalendarElegant";
import FasceOrarie from "./FasceOrarie";

type Veicolo = {
    id: number;
    marca: string;
    modello: string;
    targa: string;
    anno?: number;
};

type Servizio = {
    id: number;
    nome: string;
    descrizione: string;
    durata_minuti: number;
    prezzo: number;
};

type Fascia = {
    ora_inizio: string;
    ora_fine: string;
};

function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
}

interface PrenotazioneModalProps {
    veicoli: Veicolo[];
    servizi: Servizio[];
    servizioPreselezionato?: number;
    onSave: (data: any) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const PrenotazioneModal: React.FC<PrenotazioneModalProps> = ({
                                                                 veicoli,
                                                                 servizi,
                                                                 servizioPreselezionato,
                                                                 onSave,
                                                                 onCancel,
                                                                 isLoading,
                                                             }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(formatDate(today));
    const [servizioId, setServizioId] = useState(servizioPreselezionato || null);
    const [veicoloId, setVeicoloId] = useState<number | null>(null);
    const [fasce, setFasce] = useState<Fascia[]>([]);
    const [oraInizio, setOraInizio] = useState("");
    const [isLoadingFasce, setIsLoadingFasce] = useState(false);
    const [oraFiltro, setOraFiltro] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (selectedDate && servizioId) {
            setIsLoadingFasce(true);
            fetch(`/api/disponibilita/fasce?data=${selectedDate}&servizio_id=${servizioId}`)
                .then(res => res.json())
                .then(res => setFasce(res.data || []))
                .finally(() => setIsLoadingFasce(false));
        } else {
            setFasce([]);
            setOraInizio("");
        }
    }, [selectedDate, servizioId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!veicoloId || !servizioId || !selectedDate || !oraInizio) return;
        const fascia = fasce.find(f => f.ora_inizio === oraInizio);
        onSave({
            veicolo_id: veicoloId,
            servizio_id: servizioId,
            data_prenotazione: selectedDate,
            ora_inizio: oraInizio,
            ora_fine: fascia?.ora_fine,
            note,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servizio</label>
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-4">
                    {servizi.map(s => (
                        <CardServizioMini
                            key={s.id}
                            servizio={s}
                            selected={servizioId === s.id}
                            onClick={() => setServizioId(s.id)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Veicolo</label>
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 px-4">
                    {veicoli.map(v => (
                        <VeicoloCardMini
                            key={v.id}
                            veicolo={v}
                            selected={veicoloId === v.id}
                            onClick={() => setVeicoloId(v.id)}
                        />
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                <CalendarElegant
                    year={currentYear}
                    month={currentMonth}
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    onPrev={() =>
                        currentMonth === 0
                            ? (setCurrentMonth(11), setCurrentYear(currentYear - 1))
                            : setCurrentMonth(currentMonth - 1)
                    }
                    onNext={() =>
                        currentMonth === 11
                            ? (setCurrentMonth(0), setCurrentYear(currentYear + 1))
                            : setCurrentMonth(currentMonth + 1)
                    }
                    minDate={today}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fascia oraria</label>
                <FasceOrarie
                    fasce={fasce}
                    selected={oraInizio}
                    onSelect={setOraInizio}
                    isLoading={isLoadingFasce}
                    oraFiltro={oraFiltro}
                    setOraFiltro={setOraFiltro}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700">Note (opzionale)</label>
                <textarea
                    className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold"
                    onClick={onCancel}
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold shadow"
                    disabled={isLoadingFasce || fasce.length === 0}
                >
                    Prenota
                </button>
            </div>
        </form>
    );
};

export default PrenotazioneModal;