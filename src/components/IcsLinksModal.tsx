import {FaGoogle, FaMicrosoft, FaApple, FaRegCopy, FaCalendarAlt} from "react-icons/fa";

interface IcsLinksModalProps {
    icsUrl: string;
    onClose: () => void;
}

const calendarLinks = (icsUrl: string) => {
    const fullUrl = window.location.origin + icsUrl;
    return [
        {
            label: "Google Calendar",
            icon: <FaGoogle className="w-5 h-5" style={{color: "#4285F4"}}/>,
            href: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(fullUrl)}`,
            color: "bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-100"
        },
        {
            label: "Outlook",
            icon: <FaMicrosoft className="w-5 h-5" style={{color: "#0078D4"}}/>,
            href: `webcal://${window.location.host}${icsUrl}`,
            color: "bg-[#E5F1FB] hover:bg-[#D0E7F8] text-[#0078D4] border border-blue-100"
        },
        {
            label: "Apple Calendar",
            icon: <FaApple className="w-5 h-5" style={{color: "#111"}}/>,
            href: `webcal://${window.location.host}${icsUrl}`,
            color: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
        }
    ];
};

const IcsLinksModal: React.FC<IcsLinksModalProps> = ({icsUrl, onClose}) => {
    const handleCopyLink = () => {
        const url = window.location.origin + icsUrl;
        navigator.clipboard.writeText(url);
        alert("Link calendario copiato!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Overlay trasparente con ombra */}
            <div
                className="absolute inset-0 bg-transparent"
                style={{boxShadow: "0 8px 32px 0 rgba(0,0,0,0.13)"}}
                onClick={onClose}
            />
            {/* Modal */}
            <div
                className="bg-white p-8 rounded-t-3xl w-full max-w-md max-h-[92vh] overflow-y-auto pointer-events-auto z-10 shadow-2xl border border-gray-200 animate-slideUp"
                style={{
                    boxShadow: "0 -10px 30px -5px rgba(0,0,0,0.12), 0 8px 40px 0 rgba(0,0,0,0.18)",
                    minHeight: "320px"
                }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-6 h-6 text-orange-500"/>
                        <h2 className="text-lg font-bold text-black">Collega il tuo calendario</h2>
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-700 ml-2"
                        onClick={onClose}
                        aria-label="Chiudi"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col gap-4">
                    <button
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-base border border-gray-300 transition"
                        onClick={handleCopyLink}
                        type="button"
                    >
                        <FaRegCopy className="w-5 h-5"/>
                        Copia link calendario
                    </button>
                    {calendarLinks(icsUrl).map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-base transition ${link.color}`}
                        >
                            {link.icon}
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default IcsLinksModal;