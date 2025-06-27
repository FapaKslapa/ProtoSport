import React from "react";

type AlertProps = {
    message: { text: string; type: "success" | "error" } | null;
    show: boolean;
    onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({message, show, onClose}) => {
    if (!message) return null;
    const isSuccess = message.type === "success";
    return (
        <div
            className={`fixed top-8 left-1/2 z-50 transform -translate-x-1/2 transition-all duration-500
                ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"}
                ${isSuccess ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}
                border px-4 sm:px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3
                w-full max-w-xs sm:max-w-md font-normal text-sm mx-4
            `}
            style={{
                color: "#18181b",
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.13)",
                transition: "all 0.5s cubic-bezier(.4,2,.6,1)",
                marginTop: "0.5rem",
                letterSpacing: "0.01em",
            }}
            role="alert"
        >
            <span
                className={`flex items-center justify-center rounded-full w-8 h-8 ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
                {isSuccess ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor"
                         viewBox="0 0 20 20">
                        <path
                            d="M16.707 6.293a1 1 0 00-1.414 0L9 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"/>
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor"
                         viewBox="0 0 20 20">
                        <path
                            d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"/>
                    </svg>
                )}
            </span>
            <span className="text-sm font-normal flex-1">{message.text}</span>
            <button
                className="ml-auto text-xl text-gray-400 hover:text-gray-700 transition-colors rounded-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-200"
                onClick={onClose}
                aria-label="Chiudi"
                type="button"
                tabIndex={0}
            >
                &times;
            </button>
        </div>
    );
};

export default Alert;