import {
    FaUsers,
    FaUser,
    FaUserShield,
    FaUserPlus,
    FaCar,
    FaCalendarAlt,
    FaHistory,
    FaCalendarCheck,
    FaCalendarDay,
    FaEuroSign,
    FaTools
} from "react-icons/fa";
import {Statistiche} from "./page";

function StatWidget({icon, label, value, color}: { icon: any, label: string, value: any, color: string }) {
    return (
        <div
            className="flex flex-col items-center bg-white rounded-2xl overflow-hidden border border-gray-100 min-w-[140px] w-full max-w-[220px] mx-auto transition hover:scale-105 duration-150
                            shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_4px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.15),_0_8px_12px_rgba(0,0,0,0.1)]"
            style={{
                height: 180,
                padding: "32px 0 24px 0"
            }}
        >
            <div className="flex items-center justify-center h-12 w-12 rounded-xl mb-2"
                 style={{background: color + "22"}}>
                {icon}
            </div>
            <div className="text-xl font-bold text-black truncate">{value}</div>
            <div className="text-gray-700 text-sm mt-1 truncate text-center">{label}</div>
        </div>
    );
}

export default function StatWidgets({
                                        stats,
                                        palette,
                                        utentiMese,
                                        profittiMese,
                                        prenotazioniMese,
                                        formatEuro
                                    }: {
    stats: Statistiche,
    palette: any,
    utentiMese: number,
    profittiMese: number,
    prenotazioniMese: number,
    formatEuro: (n: number) => string
}) {
    return (
        <>
            {/* --- UTENTI --- */}
            <section className="mb-10">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <FaUsers className="text-rose-500"/> Utenti
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatWidget icon={<FaUsers className="text-rose-500 text-2xl"/>} label="Totali"
                                value={stats.totUtenti} color={palette.primary}/>
                    <StatWidget icon={<FaUser className="text-rose-400 text-2xl"/>} label="Base"
                                value={stats.totUtentiBase} color={palette.secondary}/>
                    <StatWidget icon={<FaUserShield className="text-rose-700 text-2xl"/>} label="Admin"
                                value={stats.totAdmin} color={palette.accent}/>
                    <StatWidget icon={<FaUserPlus className="text-rose-500 text-2xl"/>} label="Nuovi questo mese"
                                value={utentiMese} color={palette.primary}/>
                </div>
            </section>

            {/* --- VEICOLI --- */}
            <section className="mb-10">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <FaCar className="text-rose-500"/> Veicoli
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <StatWidget icon={<FaCar className="text-rose-500 text-2xl"/>} label="Totali registrati"
                                value={stats.totVeicoli} color={palette.primary}/>
                </div>
            </section>

            {/* --- PRENOTAZIONI --- */}
            <section className="mb-10">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="text-rose-500"/> Prenotazioni
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatWidget icon={<FaCalendarAlt className="text-rose-500 text-2xl"/>} label="Totali"
                                value={stats.totPrenotazioni} color={palette.primary}/>
                    <StatWidget icon={<FaHistory className="text-rose-300 text-2xl"/>} label="Passate"
                                value={stats.prenotazioniPassate} color={palette.pink}/>
                    <StatWidget icon={<FaCalendarCheck className="text-rose-400 text-2xl"/>} label="Future"
                                value={stats.prenotazioniFuture} color={palette.primary}/>
                    <StatWidget icon={<FaCalendarDay className="text-rose-500 text-2xl"/>} label="Oggi"
                                value={stats.prenotazioniOggi} color={palette.orange}/>
                </div>
            </section>

            {/* --- PROFITTI & SERVIZI --- */}
            <section className="mb-10">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <FaEuroSign className="text-rose-500"/> Profitti & Servizi
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <StatWidget icon={<FaEuroSign className="text-rose-500 text-2xl"/>} label="Profitti totali"
                                value={formatEuro(stats.totProfitti)} color={palette.primary}/>
                    <StatWidget icon={<FaEuroSign className="text-rose-500 text-2xl"/>} label="Profitti mese"
                                value={formatEuro(profittiMese)} color={palette.primary}/>
                    <StatWidget icon={<FaTools className="text-rose-500 text-2xl"/>} label="Servizi attivi"
                                value={stats.totServizi} color={palette.primary}/>
                </div>
            </section>
        </>
    );
}