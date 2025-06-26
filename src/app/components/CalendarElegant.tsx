import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    format,
    addDays,
    isBefore
} from 'date-fns';
import {it} from 'date-fns/locale';

interface CalendarElegantProps {
    year: number;
    month: number; // 0-based
    selectedDate: string; // yyyy-MM-dd
    onSelect: (date: string) => void;
    onPrev: () => void;
    onNext: () => void;
    minDate?: Date;
}

const CalendarElegant: React.FC<CalendarElegantProps> = ({
                                                             year,
                                                             month,
                                                             selectedDate,
                                                             onSelect,
                                                             onPrev,
                                                             onNext,
                                                             minDate
                                                         }) => {
    const today = new Date();
    const selected = selectedDate ? new Date(selectedDate + 'T12:00:00') : null;
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(monthStart);
    const weekStart = startOfWeek(monthStart, {weekStartsOn: 1});
    const weekEnd = endOfWeek(monthEnd, {weekStartsOn: 1});

    const rows: React.ReactNode[] = [];
    let currentDay = weekStart;

    while (currentDay <= weekEnd) {
        const days: React.ReactNode[] = [];
        for (let i = 0; i < 7; i++) {
            const day = currentDay;
            const isDisabled = (minDate && isBefore(day, minDate)) || !isSameMonth(day, monthStart);
            const isSelected = selected && isSameDay(day, selected);
            const isToday = isSameDay(day, today);

            days.push(
                <button
                    key={format(day, 'yyyy-MM-dd')}
                    type="button"
                    disabled={isDisabled}
                    className={`
        w-10 h-12 md:w-12 md:h-14 rounded-2xl flex items-center justify-center text-base font-medium
        transition-all duration-150 outline-none
        ${isDisabled ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : isSelected ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-400'
                            : isToday ? 'bg-white text-red-500 border-2 border-red-400 font-bold'
                                : 'bg-white text-gray-800 hover:bg-red-100 hover:text-red-600'}
        focus:ring-2 focus:ring-red-400
    `}
                    style={{
                        boxShadow: isSelected ? '0 2px 8px 0 rgba(250,72,27,0.15)' : undefined,
                        position: 'relative'
                    }}
                    onClick={() => onSelect(format(day, 'yyyy-MM-dd'))}
                    tabIndex={isDisabled ? -1 : 0}
                >
                    {format(day, 'd')}
                </button>
            );
            currentDay = addDays(currentDay, 1);
        }
        rows.push(
            <div className="grid grid-cols-7 gap-2 mb-1" key={format(addDays(currentDay, -1), 'yyyy-MM-dd')}>
                {days}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-4 shadow-lg w-full max-w-sm mx-auto border border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-100" aria-label="Mese precedente">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <span className="font-semibold text-gray-900 text-base capitalize select-none">
                                    {format(monthStart, 'MMMM yyyy', {locale: it})}
                                </span>
                <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100" aria-label="Mese successivo">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2 select-none">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="font-semibold">{d}</div>
                ))}
            </div>
            {rows}
        </div>
    );
};

export default CalendarElegant;