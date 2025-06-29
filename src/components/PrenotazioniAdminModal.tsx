import React, {useState, useMemo, useEffect} from "react";
import Modal from "./Modal";
import StatoBadgeAdmin, {StatoPrenotazione} from "./StatoBadgeAdmin";
import PrenotazioneCard from "./PrenotazioneCard";

export interface Prenotazione {
    id: number;
    user_nome: string;
    user_cognome: string;
    servizio_nome: string;
    data_prenotazione: string; // YYYY-MM-DD
    ora_inizio: string; // HH:mm
    ora_fine: string;   // HH:mm
    stato?: StatoPrenotazione;
    veicolo: string;
    targa: string;
}

interface Props {
    prenotazioni: Prenotazione[];
    onClose: () => void;
    isOpen: boolean;
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const formatDateLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

const PrenotazioniAdminModal: React.FC<Props> = ({prenotazioni, onClose, isOpen}) => {
    const today = formatDate(new Date());
    const dateList = useMemo(() => {
        const unique = Array.from(new Set(prenotazioni.map(p => p.data_prenotazione))).sort();
        return unique.length ? unique : [today];
    }, [prenotazioni, today]);

    const getClosestDate = () => {
        if (dateList.includes(today)) return today;
        let minDiff = Infinity, closest = dateList[0];
        for (const d of dateList) {
            const diff = Math.abs(new Date(d).getTime() - new Date(today).getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closest = d;
            }
        }
        return closest;
    };

    const [selectedDate, setSelectedDate] = useState(getClosestDate());
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [localPrenotazioni, setLocalPrenotazioni] = useState(prenotazioni);

    useEffect(() => {
        setLocalPrenotazioni(prenotazioni);
    }, [prenotazioni]);

    useEffect(() => {
        setSelectedDate(getClosestDate());
        // eslint-disable-next-line
    }, [dateList.join(","), today]);

    const prenotazioniDelGiorno = localPrenotazioni
        .filter(p => p.data_prenotazione === selectedDate)
        .sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio));
    const currentIndex = dateList.indexOf(selectedDate);

    const handleChangeStato = async (id: number, nuovoStato: StatoPrenotazione) => {
        setUpdatingId(id);
        setLocalPrenotazioni(prev =>
            prev.map(p => p.id === id ? {...p, stato: nuovoStato} : p)
        );
        try {
            await fetch(`/api/prenotazioni/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({stato: nuovoStato}),
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-3xl"
            title="Prenotazioni"
        >
            <div className="sticky top-0 bg-white z-20 pb-2 mb-2">
                <div className="flex items-center justify-center mb-6 gap-6">
                    <button
                        onClick={() => setSelectedDate(dateList[Math.max(0, currentIndex - 1)])}
                        disabled={currentIndex === 0}
                        className={`p-3 rounded-full border bg-white shadow transition-all duration-150
                            ${currentIndex === 0 ? "text-gray-300 border-gray-200" : "text-red-500 border-red-200 hover:bg-red-50 hover:scale-110"}`}
                        aria-label="Giorno precedente"
                        type="button"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2}
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <span
                        className="px-6 py-2 rounded-full bg-red-50 text-black font-bold text-lg shadow border border-red-100 min-w-[180px] text-center">
                        {selectedDate === today ? "Oggi" : formatDateLabel(selectedDate)}
                    </span>
                    <button
                        onClick={() => setSelectedDate(dateList[Math.min(dateList.length - 1, currentIndex + 1)])}
                        disabled={currentIndex === dateList.length - 1}
                        className={`p-3 rounded-full border bg-white shadow transition-all duration-150
                            ${currentIndex === dateList.length - 1 ? "text-gray-300 border-gray-200" : "text-red-500 border-red-200 hover:bg-red-50 hover:scale-110"}`}
                        aria-label="Giorno successivo"
                        type="button"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2}
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
            {prenotazioniDelGiorno.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-lg font-medium">
                    Nessuna prenotazione per questa data.
                </div>
            ) : (
                <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-x-7">
                    {prenotazioniDelGiorno.map((p) => {
                        const oggi = new Date();
                        oggi.setHours(0, 0, 0, 0);
                        const dataPren = new Date(p.data_prenotazione);
                        dataPren.setHours(0, 0, 0, 0);
                        const isFutura = dataPren >= oggi;
                        return (
                            <PrenotazioneCard
                                key={p.id}
                                prenotazione={p}
                                isFutura={isFutura}
                                onChangeStato={nuovo => handleChangeStato(p.id, nuovo)}
                                updating={updatingId === p.id}
                            />
                        );
                    })}
                </div>
            )}
        </Modal>
    );
};

export default PrenotazioniAdminModal;