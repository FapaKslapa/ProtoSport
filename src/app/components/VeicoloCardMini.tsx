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
        className={`flex items-center w-full p-3 rounded-xl border-2 mb-2 transition-all duration-200 text-left ${
            selected ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:border-red-300 bg-white'
        }`}
        style={{position: 'relative'}}
    >
        <div className="relative w-12 h-12 flex-shrink-0 mr-3">
            <Image
                src="/placeholder.png"
                alt={`${veicolo.marca} ${veicolo.modello}`}
                fill
                style={{objectFit: 'contain'}}
                priority
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-800 break-words whitespace-normal leading-tight">
                {veicolo.marca}
            </div>
            <div className="text-sm text-gray-600 break-words whitespace-normal">{veicolo.modello}</div>
            <div className="text-xs text-gray-400">
                {veicolo.targa} {veicolo.anno && `· ${veicolo.anno}`}
            </div>
        </div>
        {selected && (
            <span className="ml-2 text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
        )}
    </button>
);

export default VeicoloCardMini;