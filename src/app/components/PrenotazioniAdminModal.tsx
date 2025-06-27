import React, {useState, useMemo, useEffect} from "react";

type Prenotazione = {
    id: number;
    user_nome: string;
    user_cognome: string;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    veicolo: string;
    targa: string;
};

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

const PrenotazioniAdminModal: React.FC<Props> = ({
                                                     prenotazioni,
                                                     onClose,
                                                     isOpen,
                                                 }) => {
    const today = formatDate(new Date());
    const dateList = useMemo(() => {
        const unique = Array.from(
            new Set(prenotazioni.map(p => p.data_prenotazione))
        ).sort();
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

    useEffect(() => {
        setSelectedDate(getClosestDate());
        // eslint-disable-next-line
    }, [dateList.join(","), today]);

    const prenotazioniDelGiorno = prenotazioni
        .filter(p => p.data_prenotazione === selectedDate)
        .sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio));
    const currentIndex = dateList.indexOf(selectedDate);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
            <div
                className="bg-white p-8 rounded-t-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl bottom-0 border border-gray-200"
                style={{
                    transition: "box-shadow 0.3s",
                    animation: "slideUp 0.3s",
                    boxShadow:
                        "0 -10px 30px -5px rgba(0,0,0,0.12), 0 8px 40px 0 rgba(0,0,0,0.18)",
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-black tracking-tight">
                        Prenotazioni di tutti gli utenti
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Chiudi"
                    >
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="flex items-center justify-center mb-6 gap-3">
                    <button
                        onClick={() => setSelectedDate(dateList[Math.max(0, currentIndex - 1)])}
                        disabled={currentIndex === 0}
                        className={`p-2 rounded-full border ${currentIndex === 0 ? "text-gray-300 border-gray-200" : "text-red-500 border-red-200 hover:bg-red-50"}`}
                        aria-label="Giorno precedente"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        min={dateList[0]}
                        max={dateList[dateList.length - 1]}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-black font-semibold text-base focus:ring-2 focus:ring-red-400 focus:border-red-400"
                        style={{width: 170}}
                    />
                    <button
                        onClick={() => setSelectedDate(dateList[Math.min(dateList.length - 1, currentIndex + 1)])}
                        disabled={currentIndex === dateList.length - 1}
                        className={`p-2 rounded-full border ${currentIndex === dateList.length - 1 ? "text-gray-300 border-gray-200" : "text-red-500 border-red-200 hover:bg-red-50"}`}
                        aria-label="Giorno successivo"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                    <span className="ml-4 text-black font-semibold text-base">
                 {selectedDate === today ? "Oggi" : formatDateLabel(selectedDate)}
               </span>
                </div>
                {prenotazioniDelGiorno.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 text-lg font-medium">
                        Nessuna prenotazione per questa data.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl shadow border-separate border-spacing-0">
                            <thead>
                            <tr className="bg-gradient-to-r from-red-50 to-white">
                                <th className="px-5 py-3 text-left font-bold text-black text-base rounded-tl-2xl">Orario</th>
                                <th className="px-5 py-3 text-left font-bold text-black text-base">Cliente</th>
                                <th className="px-5 py-3 text-left font-bold text-black text-base">Servizio</th>
                                <th className="px-5 py-3 text-left font-bold text-black text-base">Veicolo</th>
                                <th className="px-5 py-3 text-left font-bold text-black text-base rounded-tr-2xl">Targa</th>
                            </tr>
                            </thead>
                            <tbody>
                            {prenotazioniDelGiorno.map((p, idx) => (
                                <tr
                                    key={p.id}
                                    className={`transition-colors duration-150 ${idx % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-100`}
                                >
                                    <td className="px-5 py-3 font-mono text-black text-base rounded-l-2xl">
                                        {p.ora_inizio} - {p.ora_fine}
                                    </td>
                                    <td className="px-5 py-3 text-black text-base">
                                        {p.user_nome} {p.user_cognome}
                                    </td>
                                    <td className="px-5 py-3 text-black text-base">{p.servizio_nome}</td>
                                    <td className="px-5 py-3 text-black text-base">{p.veicolo}</td>
                                    <td className="px-5 py-3 text-black text-base rounded-r-2xl">{p.targa}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style jsx>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.3) sepia(1) saturate(5) hue-rotate(-10deg);
                }
            `}</style>
        </div>
    );
};

export default PrenotazioniAdminModal;