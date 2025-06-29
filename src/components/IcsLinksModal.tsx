import React from "react";
import {FaGoogle, FaMicrosoft, FaApple, FaRegCopy, FaCalendarAlt} from "react-icons/fa";
import Modal from "./Modal";

interface IcsLinksModalProps {
    icsUrl: string;
    onClose: () => void;
    isOpen: boolean;
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

const IcsLinksModal: React.FC<IcsLinksModalProps> = ({icsUrl, onClose, isOpen}) => {
    const handleCopyLink = async () => {
        const url = window.location.origin + icsUrl;
        try {
            await navigator.clipboard.writeText(url);
            alert("Link calendario copiato!");
        } catch (err) {
            alert("Errore nella copia del link.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-md"
            className="p-8"
            title={
                <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-6 h-6 text-orange-500"/>
                    <span className="text-lg font-bold text-black">Collega il tuo calendario</span>
                </div>
            }
            style={{
                minHeight: "320px"
            }}
        >
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
        </Modal>
    );
};

export default IcsLinksModal;