import React from "react";
import StatoBadge, {StatoPrenotazione} from "./StatoBadge";
import Modal from "./Modal";

type Prenotazione = {
    id: number;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato?: StatoPrenotazione;
    veicolo: string;
    targa: string;
};

interface Props {
    prenotazioni: Prenotazione[];
    isOpen: boolean;
    onClose: () => void;
    isLoading?: boolean;
}

const formatDateLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

const PrenotazioneStoricoCard: React.FC<{ prenotazione: Prenotazione }> = ({prenotazione}) => (
    <div className="rounded-2xl border p-5 shadow flex flex-col gap-3 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-3 mb-1">
                <span className="rounded-full bg-gray-200 p-2">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}
                         viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </span>
            <span className="font-bold text-black text-lg">{prenotazione.servizio_nome}</span>
            {prenotazione.stato && <StatoBadge stato={prenotazione.stato}/>}
        </div>
        <div className="flex items-center gap-2 text-gray-700 text-base font-medium">
                <span className="rounded-full bg-blue-100 p-1">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}
                         viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                </span>
            {prenotazione.ora_inizio} - {prenotazione.ora_fine}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-green-100 p-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}
                         viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="6" rx="2" stroke="currentColor"
                              strokeWidth="2"/>
                        <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor"/>
                        <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor"/>
                    </svg>
                </span>
            <span className="text-base md:text-lg font-semibold">{prenotazione.veicolo}</span> ({prenotazione.targa})
        </div>
        <div className="text-xs text-gray-500">
            {formatDateLabel(prenotazione.data_prenotazione)}
        </div>
    </div>
);

const StoricoPrenotazioniModal: React.FC<Props> = ({
                                                       prenotazioni,
                                                       isOpen,
                                                       onClose,
                                                       isLoading,
                                                   }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-lg"
        className="p-0"
        title={
            <div className="flex items-center gap-3">
                    <span className="rounded-full bg-gray-100 p-2">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor"
                             strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </span>
                <span className="text-xl font-extrabold text-black tracking-tight">Storico prenotazioni</span>
            </div>
        }
        showCloseButton
    >
        <div className="px-4 pb-6 pt-4">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div
                        className="animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                </div>
            ) : prenotazioni.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-lg font-medium">
                    Nessuna prenotazione passata trovata.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {prenotazioni.map(p => (
                        <PrenotazioneStoricoCard key={p.id} prenotazione={p}/>
                    ))}
                </div>
            )}
        </div>
    </Modal>
);

export default StoricoPrenotazioniModal;