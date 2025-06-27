import React from "react";

export type StatoPrenotazione = "accettata" | "rifiutata" | "in attesa" | string;

interface StatoBadgeProps {
    stato: StatoPrenotazione;
}

const StatoBadge: React.FC<StatoBadgeProps> = ({ stato }) => {
    let style = "bg-yellow-100 text-yellow-800 border-yellow-200";
    let icon = (
        <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
        </>
    );

    if (stato === "accettata") {
        style = "bg-green-100 text-green-700 border-green-200";
        icon = (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
        );
    } else if (stato === "rifiutata") {
        style = "bg-red-100 text-red-700 border-red-200";
        icon = (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        );
    }

    return (
        <span
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm uppercase ml-2 ${style}`}
            style={{ whiteSpace: "nowrap" }}
        >
            {icon}
            {stato}
        </span>
    );
};

export default StatoBadge;