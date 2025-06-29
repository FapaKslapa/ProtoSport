import React from "react";
import ServiceIcon from "./ServiceIcon";

export interface Servizio {
    id: number;
    nome: string;
    durata_minuti: number;
    prezzo: number;
}

export interface CardServizioMiniProps {
    servizio: Servizio;
    selected?: boolean;
    onClick?: () => void;
}

const CardServizioMini: React.FC<CardServizioMiniProps> = ({
                                                               servizio,
                                                               selected = false,
                                                               onClick,
                                                           }) => (
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
        <ServiceIcon id={servizio.id}/>
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

export default CardServizioMini;