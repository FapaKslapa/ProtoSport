import React from "react";

export interface Servizio {
    id: number;
    nome: string;
    descrizione: string;
    durata_minuti: number;
    prezzo: number;
}

interface ServizioCardProps {
    servizio: Servizio;
    onEdit: (servizio: Servizio) => void;
    onDelete: (id: number) => void;
    iconColor?: string;
}

const ICON_COLORS = [
    "bg-pink-500 text-pink-100",
    "bg-blue-500 text-blue-100",
    "bg-green-500 text-green-100",
    "bg-yellow-500 text-yellow-100",
    "bg-red-500 text-red-100",
    "bg-indigo-500 text-indigo-100",
    "bg-teal-500 text-teal-100",
];

function getColorClass(id: number, iconColor?: string) {
    if (iconColor) return iconColor;
    return ICON_COLORS[id % ICON_COLORS.length];
}

const ServizioCard: React.FC<ServizioCardProps> = ({servizio, onEdit, onDelete, iconColor}) => {
    const {id, nome, descrizione, durata_minuti, prezzo} = servizio;
    const colorClass = getColorClass(id, iconColor);

    return (
        <div
            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col min-w-[320px] max-w-xs w-full">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-3 justify-between">
                    <div className="flex items-center">
                        <div className={`rounded-full p-2 mr-3 flex items-center justify-center ${colorClass}`}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                    fill="currentColor"
                                />
                                <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.2"/>
                            </svg>
                        </div>
                        <h4 className="font-bold text-xl text-black">{nome}</h4>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(servizio)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label="Modifica servizio"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Elimina servizio"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <p className="text-gray-700 text-base mb-4 line-clamp-3" style={{minHeight: "60px"}}>
                    {descrizione}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center">
                        <span className="mr-3 flex items-center">
                            <svg className="w-5 h-5 text-black mr-2" fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="2"/>
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

export default ServizioCard;