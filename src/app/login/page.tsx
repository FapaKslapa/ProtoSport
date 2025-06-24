"use client";

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState("+39");
    const router = useRouter();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Mantiene sempre il prefisso +39
        if (inputValue.startsWith("+39")) {
            setPhoneNumber(inputValue);
        } else {
            setPhoneNumber("+39" + inputValue.replace(/^\+39/, ""));
        }
    };

    const handleSendSMS = () => {
        // Logica per inviare l'SMS
        console.log("Invio SMS al numero:", phoneNumber);
        router.push('/verify');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full"
             style={{backgroundColor: "#FA481B"}}>
            {/* Freccia per tornare alla home */}
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <div className="text-white text-3xl cursor-pointer">
                        &#8592;
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-xl px-6 py-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-white mb-6">
                    Verifica del tuo account
                </h1>
                <p className="text-white text-lg mb-8 text-center">
                    Ti manderemo un sms al tuo numero in modo da verificare se sei già attivo o se dobbiamo fare un
                    nuovo account
                </p>
                <div className="w-full mb-8">
                    <label
                        className="block mb-2 text-lg font-medium text-center"
                        style={{color: "#656571"}}
                    >
                        il tuo numero di telefono
                    </label>
                    <div className="w-3/5 mx-auto relative">
        <span
            className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-2xl select-none"
            style={{color: "#fff"}}
        >
    +39
</span>
                        <input
                            type="tel"
                            value={phoneNumber.replace(/^\+39/, "")}
                            onChange={e => setPhoneNumber("+39" + e.target.value.replace(/^\+39/, ""))}
                            className="w-full pl-20 pr-4 py-4 bg-transparent font-bold text-2xl border-0 border-b-2 focus:border-b-2 focus:outline-none"
                            style={{
                                borderRadius: 0,
                                color: "#fff",
                                borderBottom: "2px solid #656571"
                            }}
                            maxLength={10}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSendSMS}
                    className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                >
                    Invia SMS
                </button>
            </div>
        </div>
    );
}
