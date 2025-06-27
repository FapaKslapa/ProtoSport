"use client";

import {useState, useEffect, ChangeEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import Alert from "@/components/Alert";

export default function Login() {
    const [phone, setPhone] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (Cookies.get("authToken")) router.push("/dashboard");
    }, [router]);

    useEffect(() => {
        if (error) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setTimeout(() => setError(""), 400);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setPhone(value);
    };

    const handleSendSMS = async () => {
        if (!phone) {
            setError("Inserisci il tuo numero di telefono");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const telefono = "+39" + phone;
            const res = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({telefono}),
            });
            const data: { error?: string } = await res.json();
            if (!res.ok) throw new Error(data.error || "Errore durante l'invio del codice");
            router.push(`/verify?telefono=${encodeURIComponent(telefono)}`);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Errore durante l'invio del codice");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full"
             style={{backgroundColor: "#FA481B"}}>
            <Alert
                message={error ? {text: error, type: "error"} : null}
                show={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    setTimeout(() => setError(""), 400);
                }}
            />
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <span className="text-white text-3xl cursor-pointer">&#8592;</span>
                </Link>
            </div>
            <div className="w-full max-w-xl px-6 py-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-white mb-6">Verifica del tuo account</h1>
                <p className="text-white text-lg mb-8 text-center">
                    Ti manderemo un sms al tuo numero in modo da verificare se sei già attivo o se dobbiamo fare un
                    nuovo account
                </p>
                <div className="w-full mb-8">
                    <label className="block mb-2 text-lg font-medium text-center" style={{color: "#656571"}}>
                        il tuo numero di telefono
                    </label>
                    <div className="w-3/5 mx-auto relative">
                                    <span
                                        className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-2xl select-none"
                                        style={{color: "#fff"}}>
                                        +39
                                    </span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={handleChange}
                            className="w-full pl-20 pr-4 py-4 bg-transparent font-bold text-2xl border-0 border-b-2 focus:border-b-2 focus:outline-none"
                            style={{
                                borderRadius: 0,
                                color: "#fff",
                                borderBottom: "2px solid #656571"
                            }}
                            maxLength={10}
                            disabled={isLoading}
                            inputMode="numeric"
                            pattern="[0-9]*"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSendSMS}
                    className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                    disabled={isLoading}
                >
                    {isLoading ? "Invio in corso..." : "Invia SMS"}
                </button>
            </div>
        </div>
    );
}