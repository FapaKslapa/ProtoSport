import React from 'react';

interface ServizioCardProps {
    servizio: {
        id: number;
        nome: string;
        descrizione: string;
        durata_minuti: number;
        prezzo: number;
    };
    onEdit: (servizio: any) => void;
    onDelete: (id: number) => void;
}

const ServizioCard: React.FC<ServizioCardProps> = ({servizio, onEdit, onDelete}) => {
    const {id, nome, descrizione, durata_minuti, prezzo} = servizio;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
                <h4 className="font-semibold text-lg mb-2 text-black">{nome}</h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden">{descrizione}</p>
                <div className="flex justify-between items-center">
                    <div className="flex-grow mr-4">
                        <span className="text-gray-800 font-medium whitespace-nowrap">{prezzo.toFixed(2)} €</span>
                        <span className="text-gray-500 text-sm ml-2 whitespace-nowrap">({durata_minuti} min)</span>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                        <button
                            onClick={() => onEdit(servizio)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
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
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServizioCard;