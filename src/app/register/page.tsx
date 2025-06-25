"use client";

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Register() {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        prefissoTelefonico: '+39',
        telefono: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
        if (!formData.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";
        if (!formData.prefissoTelefonico.trim()) newErrors.prefissoTelefonico = "Il prefisso è obbligatorio";

        // Validazione numero telefono
        if (!formData.telefono.trim()) {
            newErrors.telefono = "Il numero di telefono è obbligatorio";
        } else if (!/^\d{10}$/.test(formData.telefono.trim())) {
            newErrors.telefono = "Inserisci un numero di telefono valido (10 cifre)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (validateForm()) {
            try {
                setIsSubmitting(true);

                const numeroCompleto = `${formData.prefissoTelefonico}${formData.telefono}`;

                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: formData.nome,
                        cognome: formData.cognome,
                        telefono: numeroCompleto
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setApiError(data.error || 'Errore durante la registrazione');
                    return;
                }

                // Registrazione completata con successo
                console.log("Registrazione completata:", data);
                router.push('/login');
            } catch (error) {
                console.error("Errore nella richiesta:", error);
                setApiError('Si è verificato un errore durante la registrazione');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full relative"
             style={{backgroundColor: "#FA481B"}}>
            {/* Freccia per tornare alla pagina precedente - spostata fuori dal container con blur */}
            <div className="absolute top-8 left-8 z-10">
                <Link href="/">
                    <div className="text-white text-3xl cursor-pointer hover:text-white/80 transition-colors">
                        &#8592;
                    </div>
                </Link>
            </div>

            <div
                className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg mx-4">
                <h1 className="text-3xl font-bold text-white mb-4">
                    Registrazione
                </h1>
                <p className="text-white/90 text-base mb-8 text-center">
                    Compila i campi per creare il tuo account
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-7">
                    <div className="transition-all duration-300 hover:translate-y-[-2px]">
                        <label
                            className="block mb-2 text-base font-medium"
                            style={{color: "#ffffff"}}
                        >
                            Nome
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{
                                color: "#fff",
                                borderBottom: "2px solid rgba(255,255,255,0.3)"
                            }}
                        />
                        {errors.nome && <p className="mt-1 text-sm text-yellow-200">{errors.nome}</p>}
                    </div>

                    <div className="transition-all duration-300 hover:translate-y-[-2px]">
                        <label
                            className="block mb-2 text-base font-medium"
                            style={{color: "#ffffff"}}
                        >
                            Cognome
                        </label>
                        <input
                            type="text"
                            name="cognome"
                            value={formData.cognome}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{
                                color: "#fff",
                                borderBottom: "2px solid rgba(255,255,255,0.3)"
                            }}
                        />
                        {errors.cognome && <p className="mt-1 text-sm text-yellow-200">{errors.cognome}</p>}
                    </div>

                    <div className="transition-all duration-300 hover:translate-y-[-2px]">
                        <label
                            className="block mb-2 text-base font-medium"
                            style={{color: "#ffffff"}}
                        >
                            Numero di telefono
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                name="prefissoTelefonico"
                                value={formData.prefissoTelefonico}
                                onChange={handleChange}
                                className="w-1/4 px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-tl-lg focus:border-white focus:outline-none transition-all duration-200"
                                style={{
                                    color: "#fff",
                                    borderBottom: "2px solid rgba(255,255,255,0.3)"
                                }}
                            />
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-3/4 px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-tr-lg focus:border-white focus:outline-none transition-all duration-200"
                                style={{
                                    color: "#fff",
                                    borderBottom: "2px solid rgba(255,255,255,0.3)"
                                }}
                            />
                        </div>
                        {errors.prefissoTelefonico &&
                            <p className="mt-1 text-sm text-yellow-200">{errors.prefissoTelefonico}</p>}
                        {errors.telefono && <p className="mt-1 text-sm text-yellow-200">{errors.telefono}</p>}
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mx-auto block bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 active:scale-98 transition-all duration-200 text-lg shadow-md disabled:opacity-70"
                        >
                            {isSubmitting ? 'Registrazione in corso...' : 'Registrati'}
                        </button>
                        {apiError && <p className="mt-3 text-center text-yellow-200">{apiError}</p>}
                    </div>
                </form>

                <p className="mt-8 text-center">
                    <span className="text-white/70">Hai già un account?</span>{" "}
                    <Link href="/login"
                          className="text-white font-medium hover:underline transition-all cursor-pointer">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    );
}