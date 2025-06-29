import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Legend,
    AreaChart,
    Area
} from "recharts";
import {FaChartLine, FaEuroSign, FaUserPlus} from "react-icons/fa";
import {Statistiche} from "./page";
import CustomTooltip from "./StatTooltip";

export default function StatCharts({
                                       stats,
                                       palette,
                                       formatEuro
                                   }: {
    stats: Statistiche,
    palette: any,
    formatEuro: (n: number) => string
}) {
    return (
        <section>
            <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                <FaChartLine className="text-rose-500"/> Analisi visiva
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
                {/* Prenotazioni mensili */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col min-w-0">
                    <div className="flex items-center mb-2 gap-2">
                        <FaChartLine className="text-rose-500 text-lg"/>
                        <h4 className="text-base font-semibold text-black">Prenotazioni mensili</h4>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={stats.prenotazioniPerMese}
                                       margin={{top: 16, right: 8, left: 0, bottom: 30}}>
                                <defs>
                                    <linearGradient id="prenotazioniGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={palette.primary} stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor={palette.primary} stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={palette.axis}/>
                                <XAxis
                                    dataKey="mese"
                                    stroke={palette.axis}
                                    fontSize={13}
                                    interval={0}
                                    height={50}
                                    tickMargin={10}
                                />
                                <YAxis stroke={palette.axis} fontSize={13} allowDecimals={false}/>
                                <Tooltip content={<CustomTooltip euro={false}/>}/>
                                <Legend iconType="circle"/>
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={palette.primary}
                                    fill="url(#prenotazioniGradient)"
                                    strokeWidth={3}
                                    legendType="none"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke={palette.primary}
                                    strokeWidth={3}
                                    dot={{r: 6, fill: "#fff", stroke: palette.primary, strokeWidth: 2}}
                                    activeDot={{r: 8, fill: "#fff", stroke: palette.primary, strokeWidth: 3}}
                                    name="Prenotazioni"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Profitti mensili */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col min-w-0">
                    <div className="flex items-center mb-2 gap-2">
                        <FaEuroSign className="text-rose-500 text-lg"/>
                        <h4 className="text-base font-semibold text-black">Profitti mensili</h4>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={stats.profittiPerMese}
                                      margin={{top: 16, right: 8, left: 0, bottom: 30}}>
                                <defs>
                                    <linearGradient id="profittiGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={palette.primary} stopOpacity={0.7}/>
                                        <stop offset="100%" stopColor={palette.primary} stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={palette.axis}/>
                                <XAxis
                                    dataKey="mese"
                                    stroke={palette.axis}
                                    fontSize={13}
                                    interval={0}
                                    height={50}
                                    tickMargin={10}
                                />
                                <YAxis stroke={palette.axis} fontSize={13} allowDecimals={false}
                                       tickFormatter={v => formatEuro(Number(v))}/>
                                <Tooltip content={<CustomTooltip euro={true}/>}/>
                                <Legend iconType="circle"/>
                                <Bar dataKey="profitto" name="Profitti" fill="url(#profittiGradient)"
                                     radius={[8, 8, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Nuovi utenti per mese */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col min-w-0">
                    <div className="flex items-center mb-2 gap-2">
                        <FaUserPlus className="text-rose-500 text-lg"/>
                        <h4 className="text-base font-semibold text-black">Nuovi utenti per mese</h4>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={stats.utentiPerMese}
                                       margin={{top: 16, right: 8, left: 0, bottom: 30}}>
                                <defs>
                                    <linearGradient id="utentiGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={palette.secondary} stopOpacity={0.7}/>
                                        <stop offset="100%" stopColor={palette.secondary} stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={palette.axis}/>
                                <XAxis
                                    dataKey="mese"
                                    stroke={palette.axis}
                                    fontSize={13}
                                    interval={0}
                                    height={50}
                                    tickMargin={10}
                                />
                                <YAxis stroke={palette.axis} fontSize={13} allowDecimals={false}/>
                                <Tooltip content={<CustomTooltip euro={false}/>}/>
                                <Legend iconType="circle"/>
                                <Area type="monotone" dataKey="count" name="Nuovi utenti"
                                      stroke={palette.secondary}
                                      fill="url(#utentiGradient)" strokeWidth={3}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
}