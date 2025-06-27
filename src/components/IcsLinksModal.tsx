import {FaGoogle, FaMicrosoft, FaApple, FaRegCopy} from "react-icons/fa";

interface IcsLinksModalProps {
    icsUrl: string;
    onClose: () => void;
}

const IcsLinksModal: React.FC<IcsLinksModalProps> = ({icsUrl, onClose}) => {
    const handleCopyLink = () => {
        const url = window.location.origin + icsUrl;
        navigator.clipboard.writeText(url);
        alert("Link calendario copiato!");
    };

    return (
        <div
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col items-center space-y-4 min-w-[260px]">
            <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition"
                onClick={handleCopyLink}
                type="button"
            >
                <FaRegCopy className="w-5 h-5"/>
                Copia link calendario
            </button>
            <a
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm transition"
                href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(window.location.origin + icsUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaGoogle className="w-5 h-5"/>
                Google Calendar
            </a>
            <a
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition"
                href={`webcal://${window.location.host}${icsUrl}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaMicrosoft className="w-5 h-5"/>
                Outlook
            </a>
            <a
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition"
                href={`webcal://${window.location.host}${icsUrl}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaApple className="w-5 h-5"/>
                Apple Calendar
            </a>
            <button
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition"
                onClick={onClose}
            >
                Chiudi
            </button>
        </div>
    );
};

export default IcsLinksModal;