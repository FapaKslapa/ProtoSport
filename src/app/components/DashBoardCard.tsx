import React from "react";

interface DashboardCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
    icon: React.ReactNode;
    iconBgColor: string;
    iconHoverColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
                                                         title,
                                                         description,
                                                         buttonText,
                                                         onClick,
                                                         icon,
                                                         iconBgColor,
                                                         iconHoverColor,
                                                     }) => (
    <div
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
        <div className="p-6">
            <div className="flex items-center mb-4">
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${iconBgColor} group-hover:${iconHoverColor}`}
                >
                    {icon}
                </div>
                <h3 className="text-lg font-semibold ml-4 text-gray-800">{title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{description}</p>
            <button
                onClick={onClick}
                className="w-full py-2.5 px-4 rounded-xl text-white font-medium flex items-center justify-center transition-all duration-300"
                style={{
                    background: "linear-gradient(135deg, #FA481B 0%, #FF6E50 100%)",
                    boxShadow: "0 4px 12px rgba(250, 72, 27, 0.2)",
                }}
            >
                <span>{buttonText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>
);

export default DashboardCard;