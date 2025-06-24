"use client";

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginMobile() {
    const [showPopup, setShowPopup] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setShowPopup(true);
    }, []);

    const redirectToLogin = () => {
        router.push('/login');
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-black">
            {/* Sfondo con immagine della moto */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Sfondo Login.jpg"
                    alt="Officina sfondo"
                    fill
                    style={{objectFit: 'cover', objectPosition: 'center'}}
                    priority
                />
            </div>

            {/* Pop-up che emerge dal basso */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-b-none rounded-4xl shadow-xl transform transition-transform duration-300 ease-out ${
                    showPopup ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{height: 'auto', minHeight: '30%', maxHeight: '50%'}}
            >
                <div className="w-16 h-1 mx-auto mt-4 mb-5"/>

                {/* Logo al centro */}
                <div className="flex justify-center mb-3 px-6">
                    <Image
                        src="/Logo Compresso.png"
                        alt="Logo Officina"
                        width={280}
                        height={90}
                        priority
                    />
                </div>

                {/* Testo motto */}
                <p className="text-center text-zinc-950 font-medium mb-6 px-6 text-lg">
                    We love your motorbike
                </p>

                <div className="px-6 pb-3">
                    <button
                        type="button"
                        onClick={redirectToLogin}
                        className="w-3/4 mx-auto block py-4 px-3 bg-black text-white font-medium text-sm rounded-full
                        hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors shadow-md"
                    >
                        Accedi
                    </button>
                </div>

                <p className="text-center pb-6">
                    <span className="text-zinc-600 text-sm">Non hai l'account?</span>{" "}
                    <Link href="/register" className="text-black font-medium text-sm hover:underline transition-all cursor-pointer">
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    );
}