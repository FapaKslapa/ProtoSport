import React, {useMemo} from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    format,
    addDays,
    isBefore,
} from "date-fns";
import {it} from "date-fns/locale";
import CalendarDayCell from "./CalendarDayCell";

interface CalendarElegantProps {
    year: number;
    month: number;
    selectedDate: string;
    onSelect: (date: string) => void;
    onPrev: () => void;
    onNext: () => void;
    minDate?: Date;
}

const WEEK_DAYS: string[] = ["L", "M", "M", "G", "V", "S", "D"];

const CalendarElegant: React.FC<CalendarElegantProps> = ({
                                                             year,
                                                             month,
                                                             selectedDate,
                                                             onSelect,
                                                             onPrev,
                                                             onNext,
                                                             minDate,
                                                         }) => {
    const today = useMemo(() => new Date(), []);
    const selected = useMemo(
        () => (selectedDate ? new Date(selectedDate + "T12:00:00") : null),
        [selectedDate]
    );
    const monthStart = useMemo(() => startOfMonth(new Date(year, month)), [year, month]);
    const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
    const weekStart = useMemo(() => startOfWeek(monthStart, {weekStartsOn: 1}), [monthStart]);
    const weekEnd = useMemo(() => endOfWeek(monthEnd, {weekStartsOn: 1}), [monthEnd]);

    const rows = useMemo(() => {
        const result: React.ReactNode[] = [];
        let currentDay = weekStart;

        while (currentDay <= weekEnd) {
            const days: React.ReactNode[] = [];
            for (let i = 0; i < 7; i++) {
                const day = currentDay;
                const isDisabled =
                    (minDate && isBefore(day, minDate)) || !isSameMonth(day, monthStart);
                const isSelected = !!selected && isSameDay(day, selected);
                const isToday = isSameDay(day, today);

                days.push(
                    <CalendarDayCell
                        key={format(day, "yyyy-MM-dd")}
                        day={day}
                        isDisabled={isDisabled}
                        isSelected={isSelected}
                        isToday={isToday}
                        onSelect={onSelect}
                    />
                );
                currentDay = addDays(currentDay, 1);
            }
            result.push(
                <div className="grid grid-cols-7 gap-2 mb-1" key={format(addDays(currentDay, -1), "yyyy-MM-dd")}>
                    {days}
                </div>
            );
        }
        return result;
    }, [weekStart, weekEnd, minDate, monthStart, selected, today, onSelect]);

    return (
        <div className="bg-white rounded-3xl p-4 shadow-lg w-full max-w-sm mx-auto border border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-100" aria-label="Mese precedente">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <span className="font-semibold text-gray-900 text-base capitalize select-none">
                    {format(monthStart, "MMMM yyyy", {locale: it})}
                </span>
                <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100" aria-label="Mese successivo">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2 select-none">
                {WEEK_DAYS.map((d, i) => (
                    <div key={i} className="font-semibold">
                        {d}
                    </div>
                ))}
            </div>
            {rows}
        </div>
    );
};

export default CalendarElegant;