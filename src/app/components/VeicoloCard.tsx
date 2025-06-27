import React from 'react';
import Image from 'next/image';

interface Veicolo {
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
}

const VeicoloCard: React.FC<VeicoloCardProps> = ({veicolo}) => {
    const {marca, modello, anno, targa} = veicolo;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_4px_8px_rgba(0,0,0,0.06)] border border-gray-200 hover:shadow-[0_16px_45px_rgba(0,0,0,0.15),_0_8px_12px_rgba(0,0,0,0.1)] transition-shadow duration-300 min-w-[280px] w-[280px] flex-shrink-0 mr-4">
            <div className="relative h-60 w-full bg-white">
                <Image
                    src="/placeholder.png"
                    alt={`${marca} ${modello}`}
                    fill
                    style={{objectFit: 'contain'}}
                    priority
                />
            </div>
            <div className="p-5 text-center">
                <h3 className="font-bold text-lg text-black">{marca} {modello}</h3>
                <div className="mt-2 text-gray-600 text-sm">
                    <span>{anno ?? 'N/D'} - {targa}</span>
                </div>
            </div>
        </div>
    );
};

export default VeicoloCard;