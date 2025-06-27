"use client";

import {useState, useRef, useEffect} from "react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import Cookies from "js-cookie";

export default function VerifyCode() {
    const [code, setCode] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [telefono, setTelefono] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const inputRefs = Array.from({length: 4}, () => useRef<HTMLInputElement>(null));

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            const userData = Cookies.get("userData");
            if (userData) {
                const user = JSON.parse(userData);
                if (user.is_admin || user.is_super_admin) router.push("/admin/dashboard");
                else router.push("/dashboard");
            } else {
                router.push("/dashboard");
            }
            return;
        }
        const tel = searchParams.get("telefono");
        if (tel) setTelefono(tel);
        else router.push("/login");
    }, [searchParams, router]);

    const handleInput = (i: number, v: string) => {
        if (/^\d?$/.test(v)) {
            const newCode = [...code];
            newCode[i] = v;
            setCode(newCode);
            if (v && i < 3) inputRefs[i + 1].current?.focus();
        }
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[i] && i > 0) inputRefs[i - 1].current?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split("");
        const newCode = [...code];
        digits.forEach((d, idx) => {
            if (idx < 4) newCode[idx] = d;
        });
        setCode(newCode);
        inputRefs[Math.min(digits.length, 3)]?.current?.focus();
    };

    const handleVerify = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({telefono, code: code.join("")}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Errore durante la verifica");
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            Cookies.set("authToken", data.token, {expires: 30, secure: true, sameSite: "strict"});
            Cookies.set("userData", JSON.stringify(data.user), {expires: 30, secure: true, sameSite: "strict"});
            if (data.dashboardType === "admin") router.push("/admin/dashboard");
            else router.push("/dashboard");
        } catch (err: any) {
            setError(err?.message || "Errore durante la verifica");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!telefono) return;
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({telefono}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Errore durante l'invio del codice");
            alert("Codice inviato nuovamente");
        } catch (err: any) {
            setError(err?.message || "Errore durante l'invio del codice");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full"
             style={{backgroundColor: "#FA481B"}}>
            <div className="absolute top-8 left-8">
                <Link href="/login">
                    <div className="text-white text-3xl cursor-pointer">&#8592;</div>
                </Link>
            </div>
            <div className="w-full max-w-xl px-6 py-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-white mb-6">Verifica account</h1>
                <p className="text-white text-lg mb-8 text-center">Abbiamo inviato l&#39;sms al numero indicato</p>
                <div className="w-full mb-8 px-8">
                    <div className="flex justify-between mt-4 mx-4">
                        {[0, 1, 2, 3].map(i => (
                            <input
                                key={i}
                                ref={inputRefs[i]}
                                type="text"
                                value={code[i]}
                                onChange={e => handleInput(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                className="w-14 h-14 text-center text-2xl font-normal rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                                style={{backgroundColor: "white", color: "#000"}}
                                maxLength={1}
                                inputMode="numeric"
                                autoFocus={i === 0}
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                </div>
                {error && (
                    <p className="text-white bg-red-500 p-2 rounded mb-4 text-center w-full">{error}</p>
                )}
                <p className="mt-6 mb-6 text-center">
                    <span style={{color: "#656571"}}>Non hai ricevuto il codice?</span>{" "}
                    <span className="text-white cursor-pointer" onClick={handleResend}
                          style={{textDecoration: "underline"}}>
                                Invia di nuovo
                              </span>
                </p>
                <button
                    onClick={handleVerify}
                    className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                    disabled={code.join("").length !== 4 || isLoading}
                >
                    {isLoading ? "Verifica in corso..." : "Verifica & Accedi"}
                </button>
            </div>
        </div>
    );
}