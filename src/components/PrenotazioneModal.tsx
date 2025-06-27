import React, {useState, useEffect, FormEvent} from "react";
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

type PrenotazioneData = {
    veicolo_id: number;
    servizio_id: number;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine?: string;
    note: string;
};

interface PrenotazioneModalProps {
    veicoli: Veicolo[];
    servizi: Servizio[];
    servizioPreselezionato?: number;
    onSave: (data: PrenotazioneData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const PrenotazioneModal: React.FC<PrenotazioneModalProps> = ({
                                                                 veicoli,
                                                                 servizi,
                                                                 servizioPreselezionato,
                                                                 onSave,
                                                                 onCancel,
                                                                 isLoading,
                                                             }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
    const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));
    const [servizioId, setServizioId] = useState<number | null>(servizioPreselezionato ?? null);
    const [veicoloId, setVeicoloId] = useState<number | null>(null);
    const [fasce, setFasce] = useState<Fascia[]>([]);
    const [oraInizio, setOraInizio] = useState<string>("");
    const [isLoadingFasce, setIsLoadingFasce] = useState<boolean>(false);
    const [oraFiltro, setOraFiltro] = useState<string>("");
    const [note, setNote] = useState<string>("");

    useEffect(() => {
        if (selectedDate && servizioId) {
            setIsLoadingFasce(true);
            fetch(`/api/disponibilita/fasce?data=${selectedDate}&servizio_id=${servizioId}`)
                .then(res => res.json())
                .then(res => setFasce(res.data ?? []))
                .finally(() => setIsLoadingFasce(false));
        } else {
            setFasce([]);
            setOraInizio("");
        }
    }, [selectedDate, servizioId]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
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
                    onPrev={handlePrevMonth}
                    onNext={handleNextMonth}
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
                <label className="block text-sm font-semibold text-black">Note (opzionale)</label>
                <textarea
                    className="mt-1 block w-full rounded-xl p-2 bg-white text-black shadow focus:ring-2 focus:ring-red-400 border border-gray-200 focus:border-red-400 focus:outline-none transition"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
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