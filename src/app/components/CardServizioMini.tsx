import React from "react";

interface CardServizioMiniProps {
    servizio: {
        id: number;
        nome: string;
        descrizione: string;
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
                                                           }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-start w-full min-w-[140px] max-w-[180px] p-3 rounded-xl border-2 mb-2 transition-all duration-200
                      ${selected ? "border-red-500 bg-red-50 shadow-md scale-105" : "border-gray-200 hover:border-red-300 bg-white"}
                      text-left`}
        style={{position: "relative"}}
    >
        <div className="flex-1 min-w-0 w-full">
            <div className="text-base font-semibold text-gray-800 break-words whitespace-normal leading-tight">
                {servizio.nome}
            </div>
            <div className="text-xs text-gray-500 mt-1 break-words whitespace-normal line-clamp-2">
                {servizio.descrizione}
            </div>
        </div>
        <div className="flex items-center justify-between w-full mt-2">
            <span className="text-xs text-gray-600">{servizio.durata_minuti} min</span>
            <span className="text-sm font-bold text-red-500">{servizio.prezzo.toFixed(2)} €</span>
        </div>
        {selected && (
            <span className="absolute top-2 right-2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
        )}
    </button>
);

export default CardServizioMini;