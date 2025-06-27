import React from "react";
import StatoBadgeAdmin, {StatoPrenotazione} from "./StatoBadgeAdmin";

export interface Prenotazione {
    id: number;
    user_nome: string;
    user_cognome: string;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato?: StatoPrenotazione;
    veicolo: string;
    targa: string;
}

interface PrenotazioneCardProps {
    prenotazione: Prenotazione;
    isFutura: boolean;
    onChangeStato: (nuovo: StatoPrenotazione) => void;
    updating: boolean;
}

const StatoDropdown: React.FC<{
    stato: StatoPrenotazione;
    onChange: (nuovo: StatoPrenotazione) => void;
    disabled?: boolean;
}> = ({stato, onChange, disabled}) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const STATO_OPTIONS: { value: StatoPrenotazione; label: string }[] = [
        {value: "richiesta", label: "richiesta"},
        {value: "accettata", label: "accettata"},
        {value: "rifiutata", label: "rifiutata"},
    ];

    return (
        <div className="relative ml-2" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold uppercase transition
                    ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}
                    bg-transparent border-0 shadow-none
                `}
                style={{whiteSpace: "nowrap"}}
                onClick={() => setOpen(v => !v)}
            >
                <StatoBadgeAdmin stato={stato} className="ml-0"/>
                <svg
                    className="w-3 h-3 ml-1 transition-transform duration-150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    style={{transform: open ? "rotate(180deg)" : "rotate(0deg)"}}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            {open && (
                <div
                    className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[120px] py-1">
                    {STATO_OPTIONS.map((opt, idx) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-full text-xs font-semibold transition
                                ${opt.value === stato ? "ring-2 ring-red-200 bg-red-50" : "hover:bg-gray-50"}
                                ${idx > 0 ? "mt-2" : ""}
                                border-0 shadow-none
                            `}
                            style={{whiteSpace: "nowrap"}}
                            onClick={() => {
                                setOpen(false);
                                if (opt.value !== stato) onChange(opt.value);
                            }}
                        >
                            <StatoBadgeAdmin stato={opt.value} className="ml-0"/>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PrenotazioneCard: React.FC<PrenotazioneCardProps> = ({
                                                               prenotazione,
                                                               isFutura,
                                                               onChangeStato,
                                                               updating,
                                                           }) => (
    <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-2xl transition-all duration-200 min-w-[320px] max-w-xs w-full">
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
            {isFutura ? (
                <StatoDropdown
                    stato={prenotazione.stato || "richiesta"}
                    onChange={onChangeStato}
                    disabled={updating}
                />
            ) : (
                <StatoBadgeAdmin stato={prenotazione.stato || "richiesta"}/>
            )}
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
            <span
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold ml-2">{prenotazione.targa}</span>
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
            <span className="text-base md:text-lg font-semibold">{prenotazione.veicolo}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor"
                        fillOpacity="0.15"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4"/>
            </svg>
            <span
                className="text-black text-sm font-semibold">{prenotazione.user_nome} {prenotazione.user_cognome}</span>
        </div>
    </div>
);

export default PrenotazioneCard;