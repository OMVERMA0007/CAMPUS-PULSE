import React from 'react';
import {
  Sparkles,
  Zap,
  Plus,
  Bell,
  Sun,
  Moon,
  Settings,
  Menu,
  X,
  Radio,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  onOpenAIInput: () => void;
  onOpenManualAdd: () => void;
  onOpenWeeklySummary: () => void;
  onOpenReminders: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  pendingRemindersCount: number;
  urgentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAIInput,
  onOpenManualAdd,
  onOpenWeeklySummary,
  onOpenReminders,
  onOpenSettings,
  onToggleSidebar,
  isSidebarOpen,
  theme,
  onToggleTheme,
  pendingRemindersCount,
  urgentCount,
}) => {
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-xl transition-colors duration-200 bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-lg shadow-purple-500/25">
              <Radio className="w-6 h-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Campus Pulse
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  AI v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Never Miss What Matters on Campus.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Date Display */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
          <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
          <span>{todayFormatted}</span>
          {urgentCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold animate-pulse">
              {urgentCount} urgent
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Weekly Briefing button */}
          <button
            onClick={onOpenWeeklySummary}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-600/20 transition-all duration-200 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            title="Weekly AI Executive Summary"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden md:inline">What do I need to know this week?</span>
            <span className="md:hidden">Weekly AI</span>
          </button>

          {/* Extract with AI button */}
          <button
            onClick={onOpenAIInput}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Extract with AI</span>
            <span className="sm:hidden">Extract</span>
          </button>

          {/* Quick Manual Add */}
          <button
            onClick={onOpenManualAdd}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            title="Add Notice Manually"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>

          {/* Reminders Icon */}
          <button
            onClick={onOpenReminders}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
            title="View Reminders"
          >
            <Bell className="w-4.5 h-4.5" />
            {pendingRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold bg-purple-600 text-white border-2 border-white dark:border-slate-950">
                {pendingRemindersCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
            title="Settings & Gemini API"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

