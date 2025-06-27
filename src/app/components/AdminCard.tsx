import React from "react";

interface Admin {
    id: number;
    nome: string;
    cognome: string;
    telefono: string;
}

interface AdminCardProps {
    admin: Admin;
    onDelete: (id: number) => void;
    onEdit: (admin: Admin) => void;
}

const AdminCard: React.FC<AdminCardProps> = ({admin, onDelete, onEdit}) => {
    const {id, nome, cognome, telefono} = admin;
    const iniziali = (nome[0] + cognome[0]).toUpperCase();
    const colorClass = (() => {
        const colors = [
            "bg-blue-500", "bg-green-500", "bg-yellow-500",
            "bg-purple-500", "bg-pink-500", "bg-indigo-500",
            "bg-red-500", "bg-orange-500", "bg-teal-500"
        ];
        const hash = (nome + cognome).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        return colors[hash % colors.length];
    })();
       
    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_4px_8px_rgba(0,0,0,0.06)] border border-gray-200 hover:shadow-[0_16px_45px_rgba(0,0,0,0.15),_0_8px_12px_rgba(0,0,0,0.1)] transition-shadow duration-300 min-w-[280px] w-[280px] flex-shrink-0 mr-4">
            <div className="p-5">
                <div className="flex items-center mb-4">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${colorClass}`}>
                        {iniziali}
                    </div>
                    <div className="ml-4">
                        <h3 className="font-bold text-lg text-black">{nome} {cognome}</h3>
                        <p className="text-black text-sm">{telefono}</p>
                    </div>
                </div>
                <div className="flex justify-end mt-2 relative z-30">
                    <button
                        onClick={() => onEdit(admin)}
                        className="text-blue-600 p-2 hover:bg-blue-100 rounded-full transition-colors mr-2"
                        aria-label="Modifica admin"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Elimina admin"
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
    );
};

export default AdminCard;