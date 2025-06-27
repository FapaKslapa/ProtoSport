import React from 'react';
import Image from 'next/image';

interface Veicolo {
    id: number;
    marca: string;
    modello: string;
    targa: string;
    anno?: number;
}

interface VeicoloCardMiniProps {
    veicolo: Veicolo;
    selected?: boolean;
    onClick?: () => void;
}

const VeicoloCardMini: React.FC<VeicoloCardMiniProps> = ({veicolo, selected, onClick}) => (
    <button
        type="button"
        onClick={onClick}
        className={`group flex items-center w-full min-w-[320px] max-w-[420px] h-[140px] p-5 rounded-2xl border-2 transition-all duration-200 bg-white shadow-lg
            ${selected
            ? 'border-red-500 bg-red-50 shadow-xl scale-[1.03]'
            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}
            focus:outline-none focus:ring-2 focus:ring-red-400`}
        style={{position: 'relative'}}
        tabIndex={0}
    >
        {/* Immagine */}
        <div
            className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mr-6">
            <Image
                src="/placeholder.png"
                alt={`${veicolo.marca} ${veicolo.modello}`}
                fill
                style={{objectFit: 'contain'}}
                priority
                className="transition-transform duration-200 group-hover:scale-105"
            />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 overflow-hidden text-left">
            <div className="text-lg font-bold text-black truncate" title={veicolo.marca}>
                {veicolo.marca}
            </div>
            <div className="text-base text-gray-700 font-medium truncate" title={veicolo.modello}>
                {veicolo.modello}
            </div>
            <div className="flex items-center gap-3 mt-2">
                <span
                    className="text-base font-mono font-semibold text-black bg-white border border-gray-300 rounded-md px-3 py-0.5 tracking-widest shadow-sm whitespace-nowrap"
                    style={{letterSpacing: "0.15em"}}>
                    {veicolo.targa}
                </span>
                {veicolo.anno && (
                    <span
                        className="text-xs text-gray-500 font-semibold bg-gray-100 rounded px-2 py-0.5 whitespace-nowrap">
                        {veicolo.anno}
                    </span>
                )}
            </div>
        </div>
        {/* Selezione */}
        {selected && (
            <span className="absolute top-3 right-3 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
            </span>
        )}
    </button>
);

export default VeicoloCardMini;