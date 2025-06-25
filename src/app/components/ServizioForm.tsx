import React, {useState, useEffect} from 'react';

interface ServizioFormProps {
    servizio?: {
        id?: number;
        nome: string;
        descrizione: string;
        durata_minuti: number;
        prezzo: number;
    };
    onSave: (servizio: any) => Promise<void>;
    onCancel: () => void;
}

const ServizioForm: React.FC<ServizioFormProps> = ({servizio, onSave, onCancel}) => {
    const [formData, setFormData] = useState({
        nome: '',
        descrizione: '',
        durata_minuti: 60,
        prezzo: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (servizio) {
            setFormData({
                nome: servizio.nome,
                descrizione: servizio.descrizione || '',
                durata_minuti: servizio.durata_minuti,
                prezzo: servizio.prezzo
            });
        }
    }, [servizio]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        if (name === 'durata_minuti' || name === 'prezzo') {
            const numValue = name === 'prezzo' ? parseFloat(value) || 0 : parseInt(value) || 0;
            setFormData({...formData, [name]: numValue});
        } else {
            setFormData({...formData, [name]: value});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.nome.trim()) {
            setError('Il nome del servizio è obbligatorio');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(servizio?.id ? {...formData, id: servizio.id} : formData);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Si è verificato un errore');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Servizio</label>
                <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Es. Tagliando completo"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Descrizione del servizio"
                    rows={3}
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durata (minuti)</label>
                <input
                    type="number"
                    name="durata_minuti"
                    value={formData.durata_minuti}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="1"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
                <input
                    type="number"
                    name="prezzo"
                    value={formData.prezzo}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                />
            </div>

            <div className="pt-4 flex space-x-3">
                <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={isLoading}
                >
                    {isLoading ? 'Salvataggio...' : (servizio?.id ? 'Aggiorna' : 'Salva')}
                </button>
            </div>
        </form>
    );
};

export default ServizioForm;