import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isValid,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, ArrowRight } from 'lucide-react';
import { CampusNotice } from '../types';
import { CATEGORY_COLORS } from '../utils/uiColors';

interface CalendarViewProps {
  notices: CampusNotice[];
  onOpenNotice: (notice: CampusNotice) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ notices, onOpenNotice }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Map notices to dates
  const noticesByDate = notices.reduce((acc, notice) => {
    if (notice.date && notice.date !== 'Not specified') {
      try {
        const d = parseISO(`${notice.date}T00:00:00`);
        if (isValid(d)) {
          const key = format(d, 'yyyy-MM-dd');
          if (!acc[key]) acc[key] = [];
          acc[key].push(notice);
        }
      } catch {
        // ignore
      }
    }
    return acc;
  }, {} as Record<string, CampusNotice[]>);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayNotices = noticesByDate[selectedDateKey] || [];

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs backdrop-blur-md">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any date to view scheduled exams, workshops, and deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on lg) */}
        <div className="lg:col-span-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const dayNotices = noticesByDate[dateKey] || [];

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-18 sm:min-h-22 p-1.5 sm:p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30'
                      : isTodayDate
                      ? 'border-purple-300 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20'
                      : isCurrentMonth
                      ? 'border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'border-transparent bg-transparent opacity-30 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isTodayDate
                          ? 'bg-purple-600 text-white'
                          : isSelected
                          ? 'text-purple-600 dark:text-purple-400 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayNotices.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {dayNotices.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayNotices.slice(0, 2).map(n => {
                      const color = CATEGORY_COLORS[n.category];
                      return (
                        <div
                          key={n.id}
                          className={`text-[9px] font-medium truncate px-1 py-0.5 rounded border ${color.bg} ${color.darkBg}`}
                        >
                          {n.title}
                        </div>
                      );
                    })}
                    {dayNotices.length > 2 && (
                      <div className="text-[9px] text-slate-400 text-right font-medium">
                        +{dayNotices.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMM d')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDayNotices.length} event{selectedDayNotices.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            {isToday(selectedDate) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Today
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedDayNotices.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No campus events scheduled on this day.
                </p>
              </div>
            ) : (
              selectedDayNotices.map(notice => {
                const color = CATEGORY_COLORS[notice.category];
                return (
                  <div
                    key={notice.id}
                    onClick={() => onOpenNotice(notice)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 cursor-pointer transition shadow-xs group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${color.bg} ${color.darkBg}`}>
                        {notice.category}
                      </span>
                      {notice.time && notice.time !== 'Not specified' && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notice.time}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-400 transition-colors line-clamp-2">
                      {notice.title}
                    </h4>
                    {notice.venue && notice.venue !== 'Not specified' && (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{notice.venue}</span>
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

