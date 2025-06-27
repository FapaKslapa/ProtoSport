import React from "react";
import Image from "next/image";
import {useCarImageBase64} from "../app/hooks/useCarImageBase64";

export interface Veicolo {
    id: number;
    marca: string;
    modello: string;
    anno?: number;
    targa: string;
    tipo: string;
    cilindrata?: number;
}

interface VeicoloCardProps {
    veicolo: Veicolo;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

const VeicoloCard: React.FC<VeicoloCardProps> = ({veicolo, onEdit, onDelete}) => {
    const {id, marca, modello, anno, targa, cilindrata} = veicolo;
    const {imgBase64, imgError} = useCarImageBase64(marca, modello, anno, cilindrata);

    const googleQuery = [marca, modello, anno, cilindrata ? `${cilindrata}cc` : "", "png"].filter(Boolean).join(" ");
    const googleUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(googleQuery)}`;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300 min-w-[280px] w-[280px] flex-shrink-0 mr-4 flex flex-col relative">
            {(onEdit || onDelete) && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label="Modifica veicolo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Elimina veicolo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    )}
                </div>
            )}
            <div className="relative h-60 w-full bg-white flex items-center justify-center">
                {imgBase64 && !imgError ? (
                    <Image
                        src={imgBase64}
                        alt={`${marca} ${modello}`}
                        fill
                        style={{objectFit: "contain"}}
                        priority
                        onError={() => {
                        }}
                        unoptimized
                    />
                ) : (
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center"
                    >
                        <span
                            className="flex flex-col items-center justify-center w-full h-full text-red-600 opacity-90 hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mb-2" fill="none"
                                 viewBox="0 0 32 32" stroke="currentColor">
                                <circle cx="15" cy="15" r="11" stroke="currentColor" strokeWidth={3}/>
                                <line x1="23" y1="23" x2="30" y2="30" stroke="currentColor" strokeWidth={3}
                                      strokeLinecap="round"/>
                            </svg>
                            <span className="text-base font-bold mt-1">Cerca online</span>
                        </span>
                    </a>
                )}
            </div>
            <div className="p-5 flex flex-col items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-2 mb-1 w-full">
                    <span className="text-lg font-bold text-black break-words text-center w-full">
                        {marca} {modello}
                    </span>
                </div>
                <span
                    className="text-base font-mono font-semibold text-black bg-white border border-gray-300 rounded-md px-3 py-0.5 tracking-widest shadow-sm whitespace-nowrap"
                    style={{letterSpacing: "0.15em"}}
                >
                    {targa}
                </span>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    {anno && (
                        <span className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5 font-semibold">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <rect x="3" y="4" width="18" height="16" rx="2"
                                      stroke="currentColor" strokeWidth={2}/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M16 2v4M8 2v4"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"
                                      strokeWidth={2}/>
                            </svg>
                            {anno}
                        </span>
                    )}
                    {cilindrata && (
                        <span className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5 font-semibold">
                            {cilindrata} cc
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VeicoloCard;