import React from 'react';
import {
  BellRing,
  Flame,
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { PriorityLevel } from '../types';

interface StatsCardsProps {
  stats: {
    total: number;
    urgent: number;
    today: number;
    upcoming: number;
    favorites: number;
    pendingReminders: number;
  };
  selectedPriority: PriorityLevel | 'All';
  onSelectPriority: (p: PriorityLevel | 'All') => void;
  onClearFilters: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  selectedPriority,
  onSelectPriority,
  onClearFilters,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Campus Announcements */}
      <div
        onClick={onClearFilters}
        className="group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            All Notices
          </span>
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <BellRing className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.total}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">active items</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
          <span>Centralized feed</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. Urgent Deadlines (<24h) */}
      <div
        onClick={() => onSelectPriority(selectedPriority === 'URGENT' ? 'All' : 'URGENT')}
        className={`group relative p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm ${
          selectedPriority === 'URGENT'
            ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/30'
            : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/40'
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-colors" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Urgent Deadlines
          </span>
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.urgent}
          </span>
          <span className="text-xs text-rose-600/70 dark:text-rose-400/70">closes &lt; 24h</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
          <span>Requires action</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. Happening Today */}
      <div
        onClick={() => onSelectPriority(selectedPriority === 'TODAY' ? 'All' : 'TODAY')}
        className={`group relative p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm ${
          selectedPriority === 'TODAY'
            ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
            : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40'
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-colors" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Happening Today
          </span>
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {stats.today}
          </span>
          <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">events scheduled</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <span>View today's events</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* 4. Upcoming Events */}
      <div
        onClick={() => onSelectPriority(selectedPriority === 'UPCOMING' ? 'All' : 'UPCOMING')}
        className={`group relative p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm ${
          selectedPriority === 'UPCOMING'
            ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30'
            : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40'
        }`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-colors" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Upcoming Events
          </span>
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {stats.upcoming}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">in future schedule</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
          <span>Browse schedule</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

