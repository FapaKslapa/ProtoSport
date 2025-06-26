"use client";

import React from 'react';

interface OrarioCardProps {
    orari: any[];
    onEdit: (giorno: number) => void;
}

const OrarioCard: React.FC<OrarioCardProps> = ({orari, onEdit}) => {
    const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    return (
        <div className="w-full">
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 hide-scrollbar">
                {giorni.map((giorno, index) => {
                    const giornoIndex = (index + 1) % 7;
                    const orario = orari.find(o => o.giorno_settimana === giornoIndex);
                    const isOpen = !!orario;

                    return (
                        <div key={index} className="flex-shrink-0 w-60 mr-4">
                            <div
                                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-lg text-black">{giorno}</h4>
                                        <button
                                            onClick={() => onEdit(giornoIndex)}
                                            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center min-h-[80px]">
                                        <div className="mr-3">
                                            {isOpen ? (
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                     className="h-6 w-6 text-green-500"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500"
                                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            {isOpen ? (
                                                <div>
                                                    <div className="text-sm text-gray-500 mb-1">Orario</div>
                                                    <div className="font-medium text-lg text-black">
                                                        {orario.ora_inizio} - {orario.ora_fine}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="font-medium text-lg text-black">Chiuso</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx global>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default OrarioCard;