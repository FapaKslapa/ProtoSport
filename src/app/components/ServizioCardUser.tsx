import React from 'react';

interface ServizioCardUserProps {
    servizio: {
        id: number;
        nome: string;
        descrizione: string;
        durata_minuti: number;
        prezzo: number;
    };
}

const ServizioCardUser: React.FC<ServizioCardUserProps> = ({servizio}) => {
    const {nome, descrizione, durata_minuti, prezzo} = servizio;

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
                <h4 className="font-semibold text-lg mb-2 text-black">{nome}</h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden">{descrizione}</p>
                <div className="flex items-center">
                    <div className="flex-grow">
                        <span className="text-gray-800 font-medium whitespace-nowrap">{prezzo.toFixed(2)} €</span>
                        <span className="text-gray-500 text-sm ml-2 whitespace-nowrap">({durata_minuti} min)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServizioCardUser;