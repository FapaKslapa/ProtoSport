import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    className?: string;
    pointerEventsAuto?: boolean;
    showCloseButton?: boolean;
    title?: React.ReactNode;
    style?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         children,
                                         maxWidth = "max-w-md",
                                         className = "",
                                         pointerEventsAuto = true,
                                         showCloseButton = true,
                                         title,
                                         style
                                     }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Overlay senza blur */}
            <div
                className="absolute inset-0"
                style={{background: "transparent", ...style}}
                onClick={onClose}
            />
            {/* Modal con ombra marcata */}
            <div
                className={`bg-white p-6 rounded-t-3xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto border border-gray-200 pointer-events-auto z-10 animate-slideUp ${className}`}
                style={{
                    boxShadow: "0 8px 40px 0 rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                    ...style
                }}
            >
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center mb-4">
                        {title && <h2 className="text-xl font-bold text-black">{title}</h2>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-700 ml-2"
                                aria-label="Chiudi"
                                type="button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                {children}
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

export default Modal;