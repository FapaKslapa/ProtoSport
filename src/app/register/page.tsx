"use client";

import {useState, ChangeEvent, FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Alert from "@/components/Alert";

type FormData = {
    nome: string;
    cognome: string;
    telefono: string;
};

type Errors = Record<keyof FormData, string>;

export default function Register() {
    const [formData, setFormData] = useState<FormData>({
        nome: "",
        cognome: "",
        telefono: "",
    });
    const [errors, setErrors] = useState<Partial<Errors>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const router = useRouter();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "telefono" ? value.replace(/\D/g, "").slice(0, 10) : value,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Errors> = {};
        if (!formData.nome.trim()) newErrors.nome = "Il nome è obbligatorio";
        if (!formData.cognome.trim()) newErrors.cognome = "Il cognome è obbligatorio";
        if (!formData.telefono.trim()) {
            newErrors.telefono = "Il numero di telefono è obbligatorio";
        } else if (!/^\d{10}$/.test(formData.telefono.trim())) {
            newErrors.telefono = "Inserisci un numero di telefono valido (10 cifre)";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError("");
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const numeroCompleto = `+39${formData.telefono}`;
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    nome: formData.nome,
                    cognome: formData.cognome,
                    telefono: numeroCompleto,
                }),
            });
            const data: { error?: string } = await response.json();
            if (!response.ok) {
                setApiError(data.error || "Errore durante la registrazione");
                return;
            }
            router.push("/login");
        } catch {
            setApiError("Si è verificato un errore durante la registrazione");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mostra Alert per errori API
    if (apiError && !showAlert) setShowAlert(true);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full relative"
             style={{backgroundColor: "#FA481B"}}>
            <Alert
                message={apiError ? {text: apiError, type: "error"} : null}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => setApiError(""), 400);
                }}
            />
            <div className="absolute top-8 left-8 z-10">
                <Link href="/">
                    <div
                        className="text-white text-3xl cursor-pointer hover:text-white/80 transition-colors">&#8592;</div>
                </Link>
            </div>
            <div
                className="w-full max-w-md px-8 py-10 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg mx-4">
                <h1 className="text-3xl font-bold text-white mb-4">Registrazione</h1>
                <p className="text-white/90 text-base mb-8 text-center">
                    Compila i campi per creare il tuo account
                </p>
                <form onSubmit={handleSubmit} className="w-full space-y-7">
                    <div>
                        <label className="block mb-2 text-base font-medium" style={{color: "#fff"}}>
                            Nome
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{color: "#fff", borderBottom: "2px solid rgba(255,255,255,0.3)"}}
                        />
                        {errors.nome && <p className="mt-1 text-sm text-yellow-200">{errors.nome}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 text-base font-medium" style={{color: "#fff"}}>
                            Cognome
                        </label>
                        <input
                            type="text"
                            name="cognome"
                            value={formData.cognome}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-t-lg focus:border-white focus:outline-none transition-all duration-200"
                            style={{color: "#fff", borderBottom: "2px solid rgba(255,255,255,0.3)"}}
                        />
                        {errors.cognome && <p className="mt-1 text-sm text-yellow-200">{errors.cognome}</p>}
                    </div>
                    <div>
                        <label className="block mb-2 text-base font-medium" style={{color: "#fff"}}>
                            Numero di telefono
                        </label>
                        <div className="flex">
                                    <span
                                        className="w-1/4 flex items-center justify-center font-bold text-lg text-white select-none bg-white/5 rounded-tl-lg border-0 border-b-2"
                                        style={{borderBottom: "2px solid rgba(255,255,255,0.3)"}}>
                                        +39
                                    </span>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-3/4 px-4 py-3 bg-white/5 font-medium text-lg border-0 border-b-2 rounded-tr-lg focus:border-white focus:outline-none transition-all duration-200"
                                style={{color: "#fff", borderBottom: "2px solid rgba(255,255,255,0.3)"}}
                                maxLength={10}
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                        {errors.telefono && <p className="mt-1 text-sm text-yellow-200">{errors.telefono}</p>}
                    </div>
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mx-auto block bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-white/90 active:scale-98 transition-all duration-200 text-lg shadow-md disabled:opacity-70"
                        >
                            {isSubmitting ? "Registrazione in corso..." : "Registrati"}
                        </button>
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