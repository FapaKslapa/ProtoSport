import React from "react";
import { format } from "date-fns";

interface CalendarDayCellProps {
    day: Date;
    isDisabled: boolean;
    isSelected: boolean;
    isToday: boolean;
    onSelect: (date: string) => void;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
    day,
    isDisabled,
    isSelected,
    isToday,
    onSelect,
}) => (
    <button
        key={format(day, "yyyy-MM-dd")}
        type="button"
        disabled={isDisabled}
        className={`w-10 h-12 md:w-12 md:h-14 rounded-2xl flex items-center justify-center text-base font-medium transition-all duration-150 outline-none
            ${isDisabled
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : isSelected
                    ? "bg-red-500 text-white shadow-lg ring-2 ring-red-400"
                    : isToday
                        ? "bg-white text-red-500 border-2 border-red-400 font-bold"
                        : "bg-white text-gray-800 hover:bg-red-100 hover:text-red-600"}
            focus:ring-2 focus:ring-red-400`}
        style={{
            boxShadow: isSelected ? "0 2px 8px 0 rgba(250,72,27,0.15)" : undefined,
            position: "relative",
        }}
        onClick={() => onSelect(format(day, "yyyy-MM-dd"))}
        tabIndex={isDisabled ? -1 : 0}
    >
        {format(day, "d")}
    </button>
);

export default CalendarDayCell;