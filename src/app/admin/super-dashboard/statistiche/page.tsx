"use client";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import DashboardNavbar from "@/components/DashboardNavbar";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {FaFileExcel} from "react-icons/fa";
import StatWidgets from "@/components/StatWidgets";
import StatCharts from "@/components/StatCharts";

export interface Statistiche {
    totPrenotazioni: number;
    totUtenti: number;
    totUtentiBase: number;
    totAdmin: number;
    totServizi: number;
    totProfitti: number;
    prenotazioniPerMese: { mese: string; count: number }[];
    profittiPerMese: { mese: string; profitto: number }[];
    utentiPerMese: { mese: string; count: number }[];
    totVeicoli: number;
    prenotazioniPassate: number;
    prenotazioniFuture: number;
    prenotazioniOggi: number;
}

export function formatEuro(val: number) {
    return val.toLocaleString("it-IT", {style: "currency", currency: "EUR", maximumFractionDigits: 0});
}

const palette = {
    primary: "#ef4444",
    secondary: "#f87171",
    accent: "#b91c1c",
    orange: "#fb923c",
    pink: "#f472b6",
    gray: "#f3f4f6",
    text: "#111",
    axis: "#111",
    bg: "#fff"
};

export default function StatisticheSuperAdmin() {
    const [stats, setStats] = useState<Statistiche | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/statistiche", {
            headers: {Authorization: `Bearer ${Cookies.get("adminAuthToken")}`},
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) throw new Error(data.error || "Errore");
                setStats(data.data);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    const handleExportExcel = () => {
        if (!stats) return;
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
            {
                "Profitti totali": stats.totProfitti,
                "Profitti mese corrente": stats.profittiPerMese.at(-1)?.profitto ?? 0,
                "Utenti totali": stats.totUtenti,
                "Utenti base": stats.totUtentiBase,
                "Admin": stats.totAdmin,
                "Servizi attivi": stats.totServizi,
                "Prenotazioni totali": stats.totPrenotazioni,
                "Prenotazioni mese corrente": stats.prenotazioniPerMese.at(-1)?.count ?? 0,
                "Nuovi utenti mese corrente": stats.utentiPerMese.at(-1)?.count ?? 0,
                "Veicoli totali": stats.totVeicoli,
                "Prenotazioni passate": stats.prenotazioniPassate,
                "Prenotazioni future": stats.prenotazioniFuture,
                "Prenotazioni oggi": stats.prenotazioniOggi,
            }
        ]), "Statistiche Generali");

        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stats.prenotazioniPerMese), "Prenotazioni per mese");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stats.profittiPerMese), "Profitti per mese");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stats.utentiPerMese), "Nuovi utenti per mese");

        const wbout = XLSX.write(wb, {bookType: "xlsx", type: "array"});
        saveAs(new Blob([wbout], {type: "application/octet-stream"}), "statistiche.xlsx");
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-spin h-10 w-10 border-4 border-rose-500 rounded-full border-t-transparent"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-screen bg-white">
            <div className="text-red-500 font-bold mb-2">Errore: {error}</div>
            <button className="px-4 py-2 bg-rose-500 text-white rounded"
                    onClick={() => window.location.reload()}>Riprova
            </button>
        </div>
    );

    if (!stats) return null;

    const meseCorrente = new Date().toISOString().slice(0, 7);
    const prenotazioniMese = stats.prenotazioniPerMese.find(m => m.mese === meseCorrente)?.count ?? 0;
    const profittiMese = stats.profittiPerMese.find(m => m.mese === meseCorrente)?.profitto ?? 0;
    const utentiMese = stats.utentiPerMese.find(m => m.mese === meseCorrente)?.count ?? 0;

    return (
        <div className="min-h-screen bg-white pb-16 relative">
            <DashboardNavbar onLogout={() => {
            }}/>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-8 w-full bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 bg-white">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/super-dashboard">
                            <span className="text-black text-3xl cursor-pointer"
                                  aria-label="Torna indietro">&#8592;</span>
                        </Link>
                        <h2 className="text-3xl font-extrabold text-black tracking-tight">
                            Dashboard Statistiche
                        </h2>
                    </div>
                    <div className="flex justify-end w-full md:w-auto">
                        <button
                            className="flex items-center gap-2 text-sm py-2 px-3 rounded-md shadow min-w-[120px]"
                            style={{background: "#fa481b", color: "#fff"}}
                            onClick={handleExportExcel}
                        >
                            <FaFileExcel className="text-base"/> Esporta in Excel
                        </button>
                    </div>
                </div>
                <StatWidgets
                    stats={stats}
                    palette={palette}
                    utentiMese={utentiMese}
                    profittiMese={profittiMese}
                    prenotazioniMese={prenotazioniMese}
                    formatEuro={formatEuro}
                />
                <StatCharts
                    stats={stats}
                    palette={palette}
                    formatEuro={formatEuro}
                />
            </div>
        </div>
    );
}