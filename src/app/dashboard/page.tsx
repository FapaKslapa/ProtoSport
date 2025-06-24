"use client";

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

// Interfaccia per il veicolo
interface Veicolo {
    id: number;
    tipo: string;
    marca: string;
    modello: string;
    anno: number;
    targa: string;
    cilindrata: number;
}

export default function Dashboard() {
    const [veicoli, setVeicoli] = useState<Veicolo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Carica i veicoli dell'utente
    useEffect(() => {
        const fetchVeicoli = async () => {
            try {
                const response = await fetch('/api/veicoli');

                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/login');
                        return;
                    }
                    throw new Error('Errore nel caricamento dei veicoli');
                }

                const data = await response.json();
                setVeicoli(data.veicoli);
            } catch (error) {
                console.error('Errore:', error);
                setError('Impossibile caricare i veicoli');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVeicoli();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="text-2xl font-bold text-[#FA481B]">
                            Auto<span className="text-black">Service</span>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Link href="/profilo" className="text-gray-700 hover:text-[#FA481B] mr-4">
                            Profilo
                        </Link>
                        <Link href="/prenotazioni" className="text-gray-700 hover:text-[#FA481B] mr-4">
                            Prenotazioni
                        </Link>
                        <button
                            className="text-gray-700 hover:text-[#FA481B]"
                            onClick={async () => {
                                await fetch('/api/auth/logout', {method: 'POST'});
                                router.push('/login');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenuto principale */}
            <main className="container mx-auto p-4 mt-6">
                <h1 className="text-2xl font-bold mb-6">I tuoi veicoli</h1>

                {isLoading ? (
                    <div className="text-center py-10">Caricamento...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : (
                    <div className="overflow-x-auto pb-4">
                        <div className="flex space-x-4 w-full">
                            {/* Card dei veicoli scorrevoli */}
                            {veicoli.map(veicolo => (
                                <div key={veicolo.id}
                                     className="min-w-[280px] p-4 rounded-lg shadow-md bg-white flex flex-col">
                                    <h3 className="text-xl font-bold mb-2">{veicolo.marca} {veicolo.modello}</h3>
                                    <div className="text-gray-600 mb-1">Tipo: {veicolo.tipo}</div>
                                    <div className="text-gray-600 mb-1">Targa: {veicolo.targa}</div>
                                    <div className="text-gray-600 mb-1">Anno: {veicolo.anno}</div>
                                    {veicolo.cilindrata && (
                                        <div className="text-gray-600 mb-1">Cilindrata: {veicolo.cilindrata} cc</div>
                                    )}
                                    <Link
                                        href={`/veicoli/${veicolo.id}`}
                                        className="mt-auto pt-2 text-center text-white bg-[#FA481B] py-2 rounded-lg hover:bg-[#e03a10] transition-colors"
                                    >
                                        Dettagli
                                    </Link>
                                </div>
                            ))}

                            {/* Card per aggiungere un nuovo veicolo */}
                            <Link href="/veicoli/nuovo">
                                <div
                                    className="min-w-[280px] p-4 rounded-lg shadow-md bg-white flex flex-col items-center justify-center h-[200px] cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#FA481B] transition-colors">
                                    <div className="text-5xl mb-2 text-[#FA481B]">+</div>
                                    <div className="text-gray-600">Aggiungi veicolo</div>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}