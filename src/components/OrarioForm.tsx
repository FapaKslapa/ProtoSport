"use client";

import React, {useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent} from "react";
import {FaCalendarAlt, FaLock} from "react-icons/fa";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";

export interface Orario {
    id?: number;
    giorno_settimana: number;
    ora_inizio: string;
    ora_fine: string;
}

type OrarioFormData = {
    giorno_settimana: number;
    ora_inizio: string;
    ora_fine: string;
    is_closed: boolean;
};

interface OrarioFormProps {
    isOpen: boolean;
    onClose: () => void;
    orario?: Orario;
    giornoSettimana: number;
    onSave: (orario?: Omit<Orario, "is_closed">) => Promise<void>;
}
    
const giorni = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
];

const OrarioForm: React.FC<OrarioFormProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   orario,
                                                   giornoSettimana,
                                                   onSave,
                                               }) => {
    const [formData, setFormData] = useState<OrarioFormData>({
        giorno_settimana: giornoSettimana,
        ora_inizio: orario?.ora_inizio ?? "09:00",
        ora_fine: orario?.ora_fine ?? "18:00",
        is_closed: !orario,
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        setFormData({
            giorno_settimana: giornoSettimana,
            ora_inizio: orario?.ora_inizio ?? "09:00",
            ora_fine: orario?.ora_fine ?? "18:00",
            is_closed: !orario,
        });
    }, [orario, giornoSettimana]);

    useEffect(() => {
        if (error) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => setError(null), 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleToggleClosed = () => {
        setFormData((prev) => ({...prev, is_closed: !prev.is_closed}));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleToggleClosed();
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            if (formData.is_closed) {
                await onSave();
                onClose();
                return;
            }
            if (formData.ora_inizio >= formData.ora_fine) {
                setError("L'ora di inizio deve essere precedente all'ora di fine");
                setIsSubmitting(false);
                return;
            }
            const {is_closed, ...dataToSave} = {...formData, id: orario?.id};
            await onSave(dataToSave);
            onClose();
        } catch (err) {
            const errorMsg =
                err instanceof Error
                    ? err.message
                    : typeof err === "object" && err && "message" in err
                        ? (err as { message: string }).message
                        : "Si è verificato un errore";
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Modifica Orario - ${giorni[formData.giorno_settimana]}`}
        >
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md mx-auto flex flex-col gap-8 relative pb-28"
                style={{minWidth: 320}}
            >
                <Alert
                    message={error ? {text: error, type: "error"} : null}
                    show={showAlert}
                    onClose={() => setShowAlert(false)}
                />
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-red-500 w-6 h-6"/>
                        <h3 className="text-xl font-bold text-black">
                            {giorni[formData.giorno_settimana]}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaLock className={`w-5 h-5 ${formData.is_closed ? "text-red-500" : "text-gray-300"}`}/>
                        <label htmlFor="is_closed" className="text-base font-medium text-black select-none">
                            Chiuso
                        </label>
                        <button
                            type="button"
                            aria-pressed={formData.is_closed}
                            aria-label="Giorno di chiusura"
                            onClick={handleToggleClosed}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                                formData.is_closed ? "bg-red-500" : "bg-gray-200"
                            }`}
                            tabIndex={0}
                            onKeyDown={handleKeyDown}
                        >
                                <span
                                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        formData.is_closed ? "translate-x-5" : ""
                                    }`}
                                />
                        </button>
                    </div>
                </div>

                <p className="text-gray-500 text-base mb-2">
                    Imposta gli orari di apertura e chiusura per questo giorno.
                </p>

                {!formData.is_closed && (
                    <div className="flex flex-row gap-6 w-full">
                        <div className="flex flex-col flex-1">
                            <label
                                htmlFor="ora_inizio"
                                className="block text-sm font-semibold text-black mb-2"
                            >
                                Orario di apertura
                            </label>
                            <input
                                type="time"
                                name="ora_inizio"
                                id="ora_inizio"
                                value={formData.ora_inizio}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition"
                                required
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label
                                htmlFor="ora_fine"
                                className="block text-sm font-semibold text-black mb-2"
                            >
                                Orario di chiusura
                            </label>
                            <input
                                type="time"
                                name="ora_fine"
                                id="ora_fine"
                                value={formData.ora_fine}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 text-black text-lg transition"
                                required
                            />
                        </div>
                    </div>
                )}

                <div
                    className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 py-4 px-4 flex justify-between max-w-md mx-auto"
                    style={{boxShadow: "0 -2px 8px rgba(0,0,0,0.04)"}}
                >
                    <button
                        type="button"
                        className="py-3 px-8 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-lg"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-3 px-8 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl font-bold shadow hover:from-red-600 hover:to-red-500 transition-all text-lg flex items-center justify-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        )}
                        {isSubmitting ? "Salvataggio..." : "Salva"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default OrarioForm;