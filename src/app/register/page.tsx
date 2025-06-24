"use client";

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Register() {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        password: '',
        confermaPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
        if (!formData.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";

        if (!formData.password) {
            newErrors.password = "La password è obbligatoria";
        } else if (formData.password.length < 6) {
            newErrors.password = "La password deve essere di almeno 6 caratteri";
        }

        if (formData.password !== formData.confermaPassword) {
            newErrors.confermaPassword = "Le password non coincidono";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            console.log("Dati di registrazione:", formData);
            // Dopo la registrazione, reindirizza alla pagina di verifica o login
            router.push('/login');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full"
             style={{backgroundColor: "#FA481B"}}>
            {/* Freccia per tornare alla pagina precedente */}
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <div className="text-white text-3xl cursor-pointer hover:text-white/80 transition-colors">
                        &#8592;
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg mx-4">
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
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{
                                color: "#fff",
                                borderBottom: "2px solid rgba(255,255,255,0.3)"
                            }}
                        />
                        {errors.password && <p className="mt-1 text-sm text-yellow-200">{errors.password}</p>}
                    </div>

                    <div className="transition-all duration-300 hover:translate-y-[-2px]">
                        <label
                            className="block mb-2 text-base font-medium"
                            style={{color: "#ffffff"}}
                        >
                            Conferma password
                        </label>
                        <input
                            type="password"
                            name="confermaPassword"
                            value={formData.confermaPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{
                                color: "#fff",
                                borderBottom: "2px solid rgba(255,255,255,0.3)"
                            }}
                        />
                        {errors.confermaPassword &&
                            <p className="mt-1 text-sm text-yellow-200">{errors.confermaPassword}</p>}
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full mx-auto block bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 active:scale-98 transition-all duration-200 text-lg shadow-md"
                        >
                            Registrati
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center">
                    <span className="text-white/70">Hai già un account?</span>{" "}
                    <Link href="/login" className="text-white font-medium hover:underline transition-all cursor-pointer">
                        Accedi
                    </Link>
                </p>
            </div>
        </div>
    );
}