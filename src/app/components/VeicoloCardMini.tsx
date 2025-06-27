import React, { useEffect, useState } from 'react';
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

async function getOrFetchCarImageBase64(marca: string, modello: string, anno?: number): Promise<string | null> {
    const query = new URLSearchParams({ marca, modello });
    if (anno) query.append('anno', anno.toString());
    const resDb = await fetch(`/api/autoFoto?${query.toString()}`);
    if (resDb.ok) {
        const { base64 } = await resDb.json();
        if (base64) return base64;
    }

    const searchTerm = [marca, modello, anno, 'png'].filter(Boolean).join(' ');
    const apiUrl = `https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(searchTerm)}`;
    const res = await fetch(apiUrl);
    const text = await res.text();
    const match = text.match(/<string[^>]*>(.*?)<\/string>/);
    if (match && match[1] && match[1].startsWith('http') && !match[1].includes('noimage')) {
        const imgRes = await fetch(match[1]);
        const blob = await imgRes.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        await fetch('/api/autoFoto', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ marca, modello, anno: anno ?? null, base64 })
        });
        return base64;
    }
    return null;
}

const VeicoloCardMini: React.FC<VeicoloCardMiniProps> = ({veicolo, selected, onClick}) => {
    const [imgBase64, setImgBase64] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getOrFetchCarImageBase64(veicolo.marca, veicolo.modello, veicolo.anno).then(base64 => {
            if (isMounted && base64) {
                // Se è una GIF, non mostrarla
                if (base64.startsWith('data:image/gif')) {
                    setImgBase64(null);
                    setImgError(true);
                } else {
                    setImgBase64(base64);
                }
            }
        });
        return () => { isMounted = false; };
    }, [veicolo.marca, veicolo.modello, veicolo.anno]);

    const googleQuery = [veicolo.marca, veicolo.modello, veicolo.anno, 'png'].filter(Boolean).join(' ');
    const googleUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(googleQuery)}`;

    return (
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
            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mr-6">
                {imgBase64 && !imgError ? (
                    <Image
                        src={imgBase64}
                        alt={`${veicolo.marca} ${veicolo.modello}`}
                        fill
                        style={{objectFit: 'contain'}}
                        priority
                        unoptimized
                        onError={() => setImgError(true)}
                        className="transition-transform duration-200 group-hover:scale-105"
                    />
                ) : (
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center"
                    >
                        {/* Icona cerca online centrata, grande e rossa */}
                        <span className="flex flex-col items-center justify-center w-full h-full text-red-600 opacity-90 hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 32 32" stroke="currentColor">
                                <circle cx="15" cy="15" r="11" stroke="currentColor" strokeWidth={3} />
                                <line x1="23" y1="23" x2="30" y2="30" stroke="currentColor" strokeWidth={3} strokeLinecap="round"/>
                            </svg>
                        </span>
                    </a>
                )}
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
};

export default VeicoloCardMini;