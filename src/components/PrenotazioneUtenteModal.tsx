import React, {useState, useMemo, useEffect} from "react";
import StatoBadge, {StatoPrenotazione} from "./StatoBadge";

export interface Prenotazione {
    id: number;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato?: StatoPrenotazione;
    veicolo: string;
    targa: string;
}

interface PrenotazioniUtenteModalProps {
    prenotazioni: Prenotazione[];
    onClose: () => void;
    isOpen: boolean;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const formatDateLabel = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

const prenotazioneToICS = (p: Prenotazione): string => {
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
};

const downloadICS = (p: Prenotazione): void => {
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
};

const PrenotazioneCard: React.FC<{ prenotazione: Prenotazione; isToday: boolean }> = ({prenotazione, isToday}) => (
    <div
        className={`min-w-[320px] max-w-[340px] snap-center rounded-2xl border p-5 shadow flex flex-col gap-3 transition-all duration-200
                        ${isToday ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"}`}
    >
        <div className="flex items-center gap-3 mb-1">
                        <span className="rounded-full bg-red-100 p-2">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}
                                 viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </span>
            <span className="font-bold text-black text-lg">{prenotazione.servizio_nome}</span>
            {prenotazione.stato && <StatoBadge stato={prenotazione.stato}/>}
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-base font-medium">
                        <span className="rounded-full bg-blue-100 p-1">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </span>
            {prenotazione.ora_inizio} - {prenotazione.ora_fine}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-green-100 p-1">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}
                                 viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor"/>
                                <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor"/>
                            </svg>
                        </span>
            <span className="text-base md:text-lg font-semibold">{prenotazione.veicolo}</span> ({prenotazione.targa})
        </div>
        <button
            onClick={() => downloadICS(prenotazione)}
            className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition self-end px-2 py-1 rounded"
            type="button"
            style={{zIndex: 1, position: "relative", background: "none", boxShadow: "none"}}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v9"/>
                <rect x="3" y="4" width="18" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Salva su calendario
        </button>
    </div>
);

const PrenotazioniUtenteModal: React.FC<PrenotazioniUtenteModalProps> = ({
                                                                             prenotazioni,
                                                                             onClose,
                                                                             isOpen,
                                                                         }) => {
    const today = formatDate(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(today);

    const dateList = useMemo<string[]>(() => {
        const unique = Array.from(
            new Set(prenotazioni.map(p => p.data_prenotazione).filter(d => d >= today))
        ).sort();
        return unique.length ? unique : [today];
    }, [prenotazioni, today]);

    useEffect(() => {
        if (!dateList.includes(selectedDate)) setSelectedDate(dateList[0]);
    }, [dateList, selectedDate]);

    const prenotazioniDelGiorno = useMemo(
        () =>
            prenotazioni
                .filter(p => p.data_prenotazione === selectedDate)
                .sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio)),
        [prenotazioni, selectedDate]
    );

    const currentIndex = dateList.indexOf(selectedDate);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div
                className="bg-white rounded-t-3xl shadow-2xl shadow-black/30 w-full max-w-lg p-0 border border-gray-200 slide-up max-h-[92vh] overflow-y-auto pointer-events-auto"
                style={{backdropFilter: "blur(2px)"}}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-red-100 p-2">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor"
                                             strokeWidth={2} viewBox="0 0 24 24">
                                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor"
                                                  strokeWidth="2"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M16 2v4M8 2v4"/>
                                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </span>
                        <h2 className="text-xl font-extrabold text-black tracking-tight">Le tue prenotazioni</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Chiudi"
                        type="button"
                    >
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                {/* Navigazione date */}
                <div className="flex items-center justify-center gap-6 px-6 py-4">
                    <button
                        onClick={() => setSelectedDate(dateList[Math.max(0, currentIndex - 1)])}
                        disabled={currentIndex === 0}
                        className={`p-3 rounded-full border bg-white shadow transition-all duration-150
                                        ${currentIndex === 0 ? "text-gray-300 border-gray-200" : "text-red-500 border-red-200 hover:bg-red-50 hover:scale-110"}`}
                        aria-label="Giorno precedente"
                        type="button"
                        style={{zIndex: 1}}
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                        style={{zIndex: 1}}
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                {/* Lista prenotazioni */}
                <div className="px-2 pb-6">
                    {prenotazioniDelGiorno.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 text-lg font-medium">
                            Nessuna prenotazione per questa data.
                        </div>
                    ) : (
                        <div
                            className={
                                prenotazioniDelGiorno.length === 1
                                    ? "flex justify-center"
                                    : "flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
                            }
                            style={prenotazioniDelGiorno.length === 1 ? {} : {WebkitOverflowScrolling: "touch"}}
                        >
                            {prenotazioniDelGiorno.map(p => (
                                <PrenotazioneCard key={p.id} prenotazione={p} isToday={selectedDate === today}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrenotazioniUtenteModal;