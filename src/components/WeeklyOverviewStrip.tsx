import React from 'react';
import { addDays, format, isToday, isSameDay, parseISO, isValid } from 'date-fns';
import { CampusNotice } from '../types';
import { Calendar, ChevronRight } from 'lucide-react';

interface WeeklyOverviewStripProps {
  notices: CampusNotice[];
  selectedDateFilter: string | null;
  onSelectDateFilter: (dateStr: string | null) => void;
}

export const WeeklyOverviewStrip: React.FC<WeeklyOverviewStripProps> = ({
  notices,
  selectedDateFilter,
  onSelectDateFilter,
}) => {
  const today = new Date();

  // Generate 7 days starting today
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Map events per date
  const eventsByDate = notices.reduce((acc, notice) => {
    if (notice.date && notice.date !== 'Not specified') {
      try {
        const d = parseISO(`${notice.date}T00:00:00`);
        if (isValid(d)) {
          const dateKey = format(d, 'yyyy-MM-dd');
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(notice);
        }
      } catch {
        // ignore
      }
    }
    return acc;
  }, {} as Record<string, CampusNotice[]>);

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            7-Day Activity Horizon
          </h3>
        </div>
        {selectedDateFilter && (
          <button
            onClick={() => onSelectDateFilter(null)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            Show All Days
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayName = format(day, 'EEE');
          const dayNum = format(day, 'd');
          const isCurrentToday = isToday(day);
          const isSelected = selectedDateFilter === dateStr;
          const count = eventsByDate[dateStr]?.length || 0;
          const hasUrgent = eventsByDate[dateStr]?.some(n => n.priority === 'URGENT');

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDateFilter(isSelected ? null : dateStr)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all duration-150 border text-center relative ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 scale-102'
                  : isCurrentToday
                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                {dayName}
              </span>
              <span className={`text-base sm:text-lg font-bold my-0.5 ${isSelected ? 'text-white' : isCurrentToday ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {dayNum}
              </span>

              {/* Event count or status dots */}
              <div className="flex items-center gap-1 h-3 mt-0.5">
                {count > 0 ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : hasUrgent
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

