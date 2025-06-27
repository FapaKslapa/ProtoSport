import React from "react";

const ICON_COLORS = [
    "bg-pink-500 text-pink-100",
    "bg-blue-500 text-blue-100",
    "bg-green-500 text-green-100",
    "bg-yellow-500 text-yellow-100",
    "bg-red-500 text-red-100",
    "bg-indigo-500 text-indigo-100",
    "bg-teal-500 text-teal-100",
];

interface ServiceIconProps {
    id: number;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({id}) => {
    const colorClass = ICON_COLORS[id % ICON_COLORS.length];
    return (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${colorClass}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="currentColor"/>
                <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.2"/>
            </svg>
        </div>
    );
};

export default ServiceIcon;