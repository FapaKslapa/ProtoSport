import React, {useState, useMemo, useEffect} from "react";

type Prenotazione = {
    id: number;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato?: string;
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
const formatDateIT = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("it-IT");

function prenotazioneToICS(p: Prenotazione) {
    const start = new Date(`${p.data_prenotazione}T${p.ora_inizio}:00`);
    const end = new Date(`${p.data_prenotazione}T${p.ora_fine}:00`);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const toICSDate = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
            d.getHours()
        )}${pad(d.getMinutes())}00`;
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Compresso//Prenotazione//IT",
        "BEGIN:VEVENT",
        `UID:prenotazione-${p.id}@compresso`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${toICSDate(start)}`,
        `DTEND:${toICSDate(end)}`,
        `SUMMARY:${p.servizio_nome}`,
        `DESCRIPTION:Veicolo: ${p.veicolo} (${p.targa})`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
}

function downloadICS(p: Prenotazione) {
    const ics = prenotazioneToICS(p);
    const blob = new Blob([ics], {type: "text/calendar"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prenotazione-${p.id}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

const PrenotazioniUtenteModal: React.FC<Props> = ({
                                                      prenotazioni,
                                                      onClose,
                                                      isOpen,
                                                  }) => {
    const today = formatDate(new Date());
    const [selectedDate, setSelectedDate] = useState(today);

    const dateList = useMemo(() => {
        const unique = Array.from(
            new Set(prenotazioni.map(p => p.data_prenotazione).filter(d => d >= today))
        ).sort();
        return unique.length ? unique : [today];
    }, [prenotazioni, today]);

    useEffect(() => {
        if (!dateList.includes(selectedDate)) setSelectedDate(dateList[0]);
    }, [dateList, selectedDate]);

    const prenotazioniDelGiorno = prenotazioni.filter(
        p => p.data_prenotazione === selectedDate
    );
    const currentIndex = dateList.indexOf(selectedDate);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-end justify-center z-50 pointer-events-none">
            <div
                className="bg-white p-6 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl bottom-0"
                style={{
                    transition: "box-shadow 0.3s",
                    animation: "slideUp 0.3s",
                    boxShadow:
                        "0 -10px 25px -5px rgba(0,0,0,0.1), 0 8px 40px 0 rgba(0,0,0,0.25)",
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">Le tue prenotazioni</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="flex items-center justify-center mb-4 gap-2">
                    <button
                        onClick={() => setSelectedDate(dateList[Math.max(0, currentIndex - 1)])}
                        disabled={currentIndex === 0}
                        className={`p-2 rounded-full ${currentIndex === 0 ? "text-gray-300" : "text-red-500 hover:bg-red-50"}`}
                        aria-label="Giorno precedente"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <span className="font-semibold text-black text-base">
                                   {selectedDate === today ? "Oggi" : formatDateLabel(selectedDate)}
                                 </span>
                    <button
                        onClick={() => setSelectedDate(dateList[Math.min(dateList.length - 1, currentIndex + 1)])}
                        disabled={currentIndex === dateList.length - 1}
                        className={`p-2 rounded-full ${currentIndex === dateList.length - 1 ? "text-gray-300" : "text-red-500 hover:bg-red-50"}`}
                        aria-label="Giorno successivo"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                {prenotazioniDelGiorno.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        Nessuna prenotazione per questa data.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {prenotazioniDelGiorno.map(p => (
                            <li
                                key={p.id}
                                className={`rounded-xl border p-4 shadow flex flex-col gap-1 ${
                                    selectedDate === today
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-200 bg-white"
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-black">{p.servizio_nome}</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                            selectedDate === today
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                           {selectedDate === today ? "OGGI" : formatDateIT(p.data_prenotazione)}
                                         </span>
                                </div>
                                <div className="text-gray-700 text-sm">
                                    {p.ora_inizio} - {p.ora_fine}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {p.veicolo} ({p.targa})
                                </div>
                                {p.stato && (
                                    <div className="text-xs mt-1">
                                        Stato: <span className="font-medium">{p.stato}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => downloadICS(p)}
                                    className="mt-2 text-xs text-blue-600 hover:underline self-end"
                                >
                                    Salva su calendario
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PrenotazioniUtenteModal;