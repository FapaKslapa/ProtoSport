import React from "react";

export type StatoPrenotazione = "richiesta" | "accettata" | "rifiutata";

interface StatoBadgeAdminProps {
    stato: StatoPrenotazione | string;
    className?: string;
    showArrow?: boolean;
    expanded?: boolean;
    onClick?: () => void;
}

const statoConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    richiesta: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
        label: "RICHIESTA"
    },
    accettata: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
        ),
        label: "ACCETTATA"
    },
    rifiutata: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        ),
        label: "RIFIUTATA"
    },
};

const StatoBadgeAdmin: React.FC<StatoBadgeAdminProps> = ({
                                                             stato,
                                                             className = "",
                                                             showArrow = false,
                                                             expanded = false,
                                                             onClick
                                                         }) => {
    const config = statoConfig[stato] || statoConfig["richiesta"];

    return (
        <span
            className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold border shadow-sm uppercase transition-all duration-200 ${config.color} ${onClick ? "cursor-pointer hover:shadow-md hover:bg-opacity-90" : ""} ${className}`}
            style={{whiteSpace: "nowrap", marginLeft: 0, maxWidth: "100%"}}
            onClick={onClick}
            title={onClick ? "Clicca per vedere i dettagli" : undefined}
            tabIndex={onClick ? 0 : -1}
            role={onClick ? "button" : undefined}
        >
                {config.icon}
            {config.label}
            {showArrow && (
                <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-200 text-black ${expanded ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 20 20"
                >
                    <polyline points="6 8 10 12 14 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
            </span>
    );
};

export default StatoBadgeAdmin;