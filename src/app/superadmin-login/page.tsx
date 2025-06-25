"use client";

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminLogin() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Controlla se l'utente è già autenticato come admin
        const token = Cookies.get('adminAuthToken');
        if (token) {
            router.push('/admin/super-dashboard');
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleLogin = async () => {
        if (!formData.username || !formData.password) {
            setError('Inserisci username e password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Credenziali non valide');
            }

            // Memorizza i dati dell'admin e il token
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            localStorage.setItem('adminToken', data.token);

            // Imposta i cookie per l'autenticazione persistente
            Cookies.set('adminAuthToken', data.token, {expires: 30, secure: true, sameSite: 'strict'});
            Cookies.set('adminUserData', JSON.stringify(data.user), {expires: 30, secure: true, sameSite: 'strict'});

            // Reindirizza l'admin alla dashboard
            router.push('/admin/super-dashboard');
        } catch (error) {
            console.error('Errore login:', error);
            setError(error instanceof Error ? error.message : 'Errore durante il login');
        } finally {
            setIsLoading(false);
        }
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
                    Accesso Super Admin
                </h1>
                <p className="text-white text-lg mb-8 text-center">
                    Inserisci le tue credenziali per accedere all'area amministrativa
                </p>

                {error && (
                    <p className="text-white bg-red-500 p-2 rounded mb-4 text-center w-full">
                        {error}
                    </p>
                )}

                <div className="w-full mb-6">
                    <label
                        className="block mb-2 text-lg font-medium text-white"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-transparent font-medium text-xl border-0 border-b-2 focus:border-b-2 focus:outline-none"
                        style={{
                            borderRadius: 0,
                            color: "#fff",
                            borderBottom: "2px solid #656571"
                        }}
                        disabled={isLoading}
                    />
                </div>

                <div className="w-full mb-8">
                    <label
                        className="block mb-2 text-lg font-medium text-white"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-transparent font-medium text-xl border-0 border-b-2 focus:border-b-2 focus:outline-none"
                        style={{
                            borderRadius: 0,
                            color: "#fff",
                            borderBottom: "2px solid #656571"
                        }}
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    className="w-3/4 bg-white text-black font-medium py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors mt-4 text-xl"
                    disabled={isLoading}
                >
                    {isLoading ? 'Accesso in corso...' : 'Accedi'}
                </button>
            </div>
        </div>
    );
}