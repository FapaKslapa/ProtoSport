import React from "react";

const ICON_COLORS = [
    "bg-pink-500 text-pink-100",
    "bg-blue-500 text-blue-100",
    "bg-green-500 text-green-100",
    "bg-yellow-500 text-yellow-100",
    "bg-red-500 text-red-100",
    "bg-indigo-500 text-indigo-100",
    "bg-teal-500 text-teal-100",
];

function getColorClass(id: number) {
    return ICON_COLORS[id % ICON_COLORS.length];
}

interface CardServizioMiniProps {
    servizio: {
        id: number;
        nome: string;
        durata_minuti: number;
        prezzo: number;
    };
    selected?: boolean;
    onClick?: () => void;
}

const CardServizioMini: React.FC<CardServizioMiniProps> = ({
                                                               servizio,
                                                               selected,
                                                               onClick,
                                                           }) => {
    const colorClass = getColorClass(servizio.id);

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex items-center w-full min-w-[220px] max-w-[320px] h-[80px] p-3 rounded-2xl border-2 transition-all duration-200 bg-white shadow
                    ${selected
                ? "border-red-500 bg-red-50 shadow-lg scale-[1.03]"
                : "border-gray-200 hover:border-red-300 hover:bg-gray-50"}
                    focus:outline-none focus:ring-2 focus:ring-red-400`}
            style={{position: "relative"}}
            tabIndex={0}
        >
            {/* Icona piccola */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${colorClass}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="currentColor"/>
                    <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.2"/>
                </svg>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <span className="text-base font-bold text-black truncate" title={servizio.nome}>
                        {servizio.nome}
                    </span>
                <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded px-2 py-0.5">
                            {servizio.durata_minuti} min
                        </span>
                    <span className="text-gray-300 text-lg select-none">·</span>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 rounded px-2 py-0.5">
                            {servizio.prezzo.toFixed(2)} €
                        </span>
                </div>
            </div>
            {/* Selezione */}
            {selected && (
                <span className="absolute top-2 right-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </span>
            )}
        </button>
    );
};

export default CardServizioMini;