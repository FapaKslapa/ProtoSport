"use client";

import React, {useState} from 'react';

interface OrarioFormProps {
    orario?: {
        id?: number;
        giorno_settimana: number;
        ora_inizio: string;
        ora_fine: string;
    };
    giornoSettimana: number;
    onSave: (orario: any) => Promise<void>;
    onCancel: () => void;
}

const OrarioForm: React.FC<OrarioFormProps> = ({orario, giornoSettimana, onSave, onCancel}) => {
    const [formData, setFormData] = useState({
        giorno_settimana: giornoSettimana,
        ora_inizio: orario?.ora_inizio || '09:00',
        ora_fine: orario?.ora_fine || '18:00',
        is_closed: !orario,
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (formData.is_closed) {
            // Se è chiuso, eliminiamo l'orario esistente
            if (orario?.id) {
                try {
                    await fetch(`/api/disponibilita/${orario.id}`, {
                        method: 'DELETE',
                    });
                    onCancel();
                } catch (error) {
                    setError('Errore durante la cancellazione dell\'orario');
                }
            } else {
                onCancel();
            }
            setIsSubmitting(false);
            return;
        }

        if (formData.ora_inizio >= formData.ora_fine) {
            setError('L\'ora di inizio deve essere precedente all\'ora di fine');
            setIsSubmitting(false);
            return;
        }

        try {
            // Destrutturazione per escludere is_closed
            const {is_closed, ...dataToSave} = {
                ...formData,
                id: orario?.id,
            };

            await onSave(dataToSave);
            onCancel();
        } catch (error: any) {
            setError(error.message || 'Si è verificato un errore');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-black">{giorni[formData.giorno_settimana]}</h3>
                <p className="text-black text-sm mt-1">Imposta gli orari di apertura e chiusura</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-8 border border-gray-100">
                <label htmlFor="is_closed" className="text-black font-medium">
                    Giorno di chiusura
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="is_closed"
                        name="is_closed"
                        checked={formData.is_closed}
                        onChange={handleChange}
                        className="sr-only peer"
                    />
                    <div
                        className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
            </div>

            {!formData.is_closed && (
                <div className="space-y-8">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <label htmlFor="ora_inizio" className="block text-sm font-semibold text-black mb-3">
                            Orario di apertura
                        </label>
                        <input
                            type="time"
                            name="ora_inizio"
                            id="ora_inizio"
                            value={formData.ora_inizio}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-red-500 focus:border-red-500 text-lg text-black"
                            required
                        />
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <label htmlFor="ora_fine" className="block text-sm font-semibold text-black mb-3">
                            Orario di chiusura
                        </label>
                        <input
                            type="time"
                            name="ora_fine"
                            id="ora_fine"
                            value={formData.ora_fine}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-red-500 focus:border-red-500 text-lg text-black"
                            required
                        />
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                    {isSubmitting ? 'Salvataggio...' : 'Salva'}
                </button>
            </div>
        </form>
    );
};

export default OrarioForm;