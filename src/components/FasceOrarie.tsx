import React, {ChangeEvent, FC, useMemo} from "react";

type Fascia = {
    ora_inizio: string;
    ora_fine: string;
};

type FasceOrarieProps = {
    fasce: Fascia[];
    selected: string;
    onSelect: (ora: string) => void;
    isLoading: boolean;
    oraFiltro: string;
    setOraFiltro: (ora: string) => void;
};

const getOreDisponibili = (fasce: Fascia[]): string[] =>
    Array.from(new Set(fasce.map(f => f.ora_inizio.split(":")[0])));

const filtraFasce = (fasce: Fascia[], oraFiltro: string): Fascia[] =>
    fasce.filter(f =>
        parseInt(f.ora_inizio.split(":")[1], 10) % 30 === 0 &&
        (oraFiltro ? f.ora_inizio.startsWith(oraFiltro) : true)
    );

const FasceOrarie: FC<FasceOrarieProps> = ({
                                               fasce,
                                               selected,
                                               onSelect,
                                               isLoading,
                                               oraFiltro,
                                               setOraFiltro,
                                           }) => {
    const oreDisponibili = useMemo(() => getOreDisponibili(fasce), [fasce]);
    const fasceFiltrate = useMemo(() => filtraFasce(fasce, oraFiltro), [fasce, oraFiltro]);

    const handleFiltroChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setOraFiltro(e.target.value);
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">Filtra:</span>
                <select
                    className="border-none bg-gray-100 rounded-lg px-2 py-0.5 text-xs focus:ring-2 focus:ring-red-400"
                    value={oraFiltro}
                    onChange={handleFiltroChange}
                >
                    <option value="">Tutte le ore</option>
                    {oreDisponibili.map(ora => (
                        <option key={ora} value={ora}>
                            {ora}:00
                        </option>
                    ))}
                </select>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <div
                        className="animate-spin h-5 w-5 border-2 border-red-400 rounded-full border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 min-w-0">
                    {fasceFiltrate.map(f => (
                        <button
                            key={f.ora_inizio}
                            type="button"
                            className={`w-full px-1.5 py-1 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-sm flex flex-col items-center
                                                                      ${selected === f.ora_inizio
                                ? "bg-red-500 text-white border-red-500 shadow-md scale-105 ring-2 ring-red-300"
                                : "bg-white text-gray-900 border-gray-200 hover:border-red-400 hover:bg-red-50"}
                                                                      focus:outline-none focus:ring-2 focus:ring-red-400`}
                            onClick={() => onSelect(f.ora_inizio)}
                        >
                                                                  <span className="font-bold tracking-wide">
                                                                      {f.ora_inizio} <span
                                                                      className="mx-1 text-gray-300">-</span> {f.ora_fine}
                                                                  </span>
                        </button>
                    ))}
                </div>
            )}
            {!isLoading && fasceFiltrate.length === 0 && (
                <div className="text-red-500 text-xs mt-3 text-center">
                    Nessuna fascia disponibile per questa data
                </div>
            )}
        </div>
    );
};

export default FasceOrarie;