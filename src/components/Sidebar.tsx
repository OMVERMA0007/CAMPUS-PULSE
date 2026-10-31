import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Star,
  Bell,
  Clock,
  Flame,
  CheckCircle,
  Tag,
  GraduationCap,
  Sparkles,
  BookOpen,
  Trophy,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Category, PriorityLevel, ViewMode, AppSettings } from '../types';
import { CATEGORIES } from '../types';
import { CATEGORY_COLORS } from '../utils/uiColors';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  selectedPriority: PriorityLevel | 'All';
  onSelectPriority: (p: PriorityLevel | 'All') => void;
  viewMode: ViewMode;
  onChangeViewMode: (vm: ViewMode) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  stats: {
    total: number;
    urgent: number;
    today: number;
    upcoming: number;
    favorites: number;
    pendingReminders: number;
  };
  categoryCounts: Record<string, number>;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenWeeklySummary: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  viewMode,
  onChangeViewMode,
  favoritesOnly,
  onToggleFavoritesOnly,
  showCompleted,
  onToggleShowCompleted,
  stats,
  categoryCounts,
  settings,
  onOpenSettings,
  onOpenWeeklySummary,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-18 left-0 z-40 h-[calc(100vh-4.5rem)] w-72 shrink-0 border-r transition-transform duration-300 ease-in-out bg-white dark:bg-slate-950/95 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main Navigation Views */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Views & Navigation
            </div>
            <nav className="space-y-1">
              {/* Dashboard / Grid */}
              <button
                onClick={() => {
                  onChangeViewMode('grid');
                  onSelectCategory('All');
                  onSelectPriority('All');
                  if (favoritesOnly) onToggleFavoritesOnly();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  viewMode === 'grid' && selectedCategory === 'All' && selectedPriority === 'All' && !favoritesOnly
                    ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-purple-500" />
                  <span>Dashboard Overview</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {stats.total}
                </span>
              </button>

              {/* Calendar View */}
              <button
                onClick={() => {
                  onChangeViewMode('calendar');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  viewMode === 'calendar'
                    ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Calendar Schedule</span>
                </div>
              </button>

              {/* Starred / Favorites */}
              <button
                onClick={() => {
                  onToggleFavoritesOnly();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  favoritesOnly
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className={`w-4 h-4 ${favoritesOnly ? 'text-amber-500 fill-amber-500' : 'text-amber-400'}`} />
                  <span>Starred / Saved</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {stats.favorites}
                </span>
              </button>
            </nav>
          </div>

          {/* Priority Highlights */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Urgency Filters
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectPriority(selectedPriority === 'URGENT' ? 'All' : 'URGENT');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  selectedPriority === 'URGENT'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Urgent (&lt;24h)</span>
                </div>
                {stats.urgent > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    {stats.urgent}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectPriority(selectedPriority === 'TODAY' ? 'All' : 'TODAY');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  selectedPriority === 'TODAY'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>Happening Today</span>
                </div>
                {stats.today > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {stats.today}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Categories
              </span>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => onSelectCategory('All')}
                  className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                const color = CATEGORY_COLORS[cat];

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(isSelected ? 'All' : cat);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-purple-600/30 dark:text-purple-200 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${color.border} shrink-0 bg-current ${color.text}`} />
                      <span className="truncate">{cat}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Banner Prompt */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-900/40 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1.5 text-purple-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Smart Assistant</span>
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-300 mb-2.5 leading-relaxed">
              Have messy WhatsApp forwards or college notices? Paste them directly to extract clean event cards!
            </p>
            <button
              onClick={onOpenWeeklySummary}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 transition"
            >
              <span>Weekly AI Brief</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Profile Card at Bottom */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60">
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {settings.userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {settings.userName}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>{settings.userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

