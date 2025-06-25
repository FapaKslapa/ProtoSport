import React, {useState, useEffect} from 'react';

interface AdminFormProps {
    admin?: {
        id: number;
        nome: string;
        cognome: string;
        telefono: string;
    };
    onSave: (admin: { id?: number; nome: string; cognome: string; telefono: string }) => Promise<void>;
    onCancel: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({admin, onSave, onCancel}) => {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        telefono: '+39'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (admin) {
            setFormData({
                nome: admin.nome,
                cognome: admin.cognome,
                telefono: admin.telefono
            });
        }
    }, [admin]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        // Gestione speciale per il campo telefono
        if (name === 'telefono') {
            // Mantiene sempre il prefisso +39
            if (value.startsWith("+39")) {
                setFormData({...formData, [name]: value});
            } else {
                setFormData({...formData, [name]: "+39" + value.replace(/^\+39/, "")});
            }
        } else {
            setFormData({...formData, [name]: value});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.nome.trim()) {
            setError('Il nome è obbligatorio');
            return;
        }
        if (!formData.cognome.trim()) {
            setError('Il cognome è obbligatorio');
            return;
        }
        if (!formData.telefono.trim() || formData.telefono === '+39') {
            setError('Il numero di telefono è obbligatorio');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(admin ? {...formData, id: admin.id} : formData);
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-black mb-2">Nome</label>
                <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-black mb-2">Cognome</label>
                <input
                    type="text"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-black mb-2">Numero di telefono</label>
                <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                />
            </div>

            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    disabled={isLoading}
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={isLoading}
                >
                    {isLoading ? 'Salvataggio...' : (admin ? 'Aggiorna' : 'Crea')}
                </button>
            </div>
        </form>
    );
};

export default AdminForm;