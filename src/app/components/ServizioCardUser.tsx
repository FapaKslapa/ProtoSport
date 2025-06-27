import React from 'react';

interface Servizio {
    id: number;
    nome: string;
    descrizione: string;
    durata_minuti: number;
    prezzo: number;
}

interface ServizioCardUserProps {
    servizio: Servizio;
    iconColor?: string;
}

const ICON_COLORS = [
    'bg-pink-500 text-pink-100',
    'bg-blue-500 text-blue-100',
    'bg-green-500 text-green-100',
    'bg-yellow-500 text-yellow-100',
    'bg-red-500 text-red-100',
    'bg-indigo-500 text-indigo-100',
    'bg-teal-500 text-teal-100',
];

function getColorClass(id: number, iconColor?: string) {
    if (iconColor) return iconColor;
    return ICON_COLORS[id % ICON_COLORS.length];
}

const ServizioCardUser: React.FC<ServizioCardUserProps> = ({servizio, iconColor}) => {
    const {id, nome, descrizione, durata_minuti, prezzo} = servizio;
    const colorClass = getColorClass(id, iconColor);

    return (
        <div
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-3">
                    <div className={`rounded-full p-2 mr-3 flex items-center justify-center ${colorClass}`}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                fill="currentColor"/>
                            <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.2"/>
                        </svg>
                    </div>
                    <h4 className="font-bold text-xl text-black">{nome}</h4>
                </div>
                <p className="text-gray-700 text-base mb-4 line-clamp-3" style={{minHeight: '60px'}}>
                    {descrizione}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center">
                            <span className="mr-3 flex items-center">
                                <svg className="w-5 h-5 text-black mr-2" fill="none" stroke="currentColor"
                                     strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                                </svg>
                                <span className="text-gray-800 font-medium text-md">{durata_minuti} min</span>
                            </span>
                    </div>
                    <span className="text-gray-400 text-sm font-semibold bg-gray-100 rounded-full px-3 py-1 ml-2">
                            {prezzo.toFixed(2)} €
                        </span>
                </div>
            </div>
        </div>
    );
};

export default ServizioCardUser;