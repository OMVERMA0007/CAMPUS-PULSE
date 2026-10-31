import React, { useState, useMemo } from 'react';
import { useCampusData } from './hooks/useCampusData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { TodaysFocus } from './components/TodaysFocus';
import { WeeklyOverviewStrip } from './components/WeeklyOverviewStrip';
import { NoticeCard } from './components/NoticeCard';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { SmartAIInputModal } from './components/SmartAIInputModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { NoticeEditModal } from './components/NoticeEditModal';
import { RemindersModal } from './components/RemindersModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CATEGORIES, Category, CampusNotice } from './types';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Plus,
  Zap,
  Sparkles,
  Inbox,
  Filter,
  CheckCircle,
  X,
  RotateCcw,
} from 'lucide-react';

export function App() {
  const {
    notices,
    filteredNotices,
    reminders,
    settings,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    favoritesOnly,
    setFavoritesOnly,
    showCompleted,
    setShowCompleted,
    addNotice,
    addNoticesBatch,
    updateNotice,
    deleteNotice,
    toggleFavorite,
    toggleCompleted,
    addReminder,
    deleteReminder,
    toggleReminderCompleted,
    setSettings,
    toggleTheme,
    resetToDemo,
  } = useCampusData();

  // Navigation & Drawer states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedNoticeForDetails, setSelectedNoticeForDetails] = useState<CampusNotice | null>(null);
  const [selectedNoticeForEdit, setSelectedNoticeForEdit] = useState<CampusNotice | null>(null);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [reminderTargetNotice, setReminderTargetNotice] = useState<CampusNotice | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };


  // Category counts map
  const categoryCounts = useMemo(() => {
    return notices.reduce((acc, notice) => {
      acc[notice.category] = (acc[notice.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [notices]);

  // Apply date horizon filter if selected
  const displayedNotices = useMemo(() => {
    if (!selectedDateFilter) return filteredNotices;
    return filteredNotices.filter(n => n.date === selectedDateFilter);
  }, [filteredNotices, selectedDateFilter]);

  const handleOpenRemindersForNotice = (notice: CampusNotice) => {
    setReminderTargetNotice(notice);
    setIsRemindersModalOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSearchQuery('');
    setSelectedDateFilter(null);
    if (favoritesOnly) setFavoritesOnly(false);
  };


  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedPriority !== 'All' ||
    searchQuery.trim() !== '' ||
    selectedDateFilter !== null ||
    favoritesOnly;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Header */}
      <Header
        onOpenAIInput={() => setIsAIModalOpen(true)}
        onOpenManualAdd={() => setIsManualAddOpen(true)}
        onOpenWeeklySummary={() => setIsWeeklyModalOpen(true)}
        onOpenReminders={() => {
          setReminderTargetNotice(null);
          setIsRemindersModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        theme={settings.theme}
        onToggleTheme={toggleTheme}
        pendingRemindersCount={stats.pendingReminders}
        urgentCount={stats.urgent}
      />

      {/* 2. Main App Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={cat => setSelectedCategory(cat)}
          selectedPriority={selectedPriority}
          onSelectPriority={p => setSelectedPriority(p)}
          viewMode={viewMode}
          onChangeViewMode={vm => setViewMode(vm)}
          favoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly(!favoritesOnly)}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
          stats={stats}
          categoryCounts={categoryCounts}
          settings={settings}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenWeeklySummary={() => setIsWeeklyModalOpen(true)}
        />

        {/* Center Content Stream */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Top KPI Statistics Cards */}
          <StatsCards
            stats={stats}
            selectedPriority={selectedPriority}
            onSelectPriority={p => setSelectedPriority(p)}
            onClearFilters={clearAllFilters}
          />

          {/* Today's Focus & Critical "Your Attention Needed" Banner */}
          <TodaysFocus
            notices={notices}
            onOpenNotice={notice => setSelectedNoticeForDetails(notice)}
            onOpenAIInput={() => setIsAIModalOpen(true)}
          />

          {/* Weekly 7-Day Activity Horizon Strip */}
          <WeeklyOverviewStrip
            notices={notices}
            selectedDateFilter={selectedDateFilter}
            onSelectDateFilter={d => setSelectedDateFilter(d)}
          />

          {/* Search, Filter & View Mode Controls */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Smart Search: title, venue, hackathon, exams, deadline..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort & Views Toggle */}
              <div className="flex items-center gap-2">
                {/* Sort Option */}
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="text-xs px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-purple-500 shadow-xs"
                >
                  <option value="soonest">Sort: Soonest Event</option>
                  <option value="deadline">Sort: Deadline Proximity</option>
                  <option value="priority">Sort: Urgency Priority</option>
                  <option value="latest">Sort: Newest Added</option>
                  <option value="alpha">Sort: Alphabetical (A-Z)</option>
                </select>

                {/* View Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="List / Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'calendar'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Calendar Schedule"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Horizontal Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'All'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800/70'
                }`}
              >
                All Categories ({stats.total})
              </button>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800/70'
                    }`}
                  >
                    {cat} {count > 0 && <span className="opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Clear Bar */}
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  Showing filtered results ({displayedNotices.length} notice{displayedNotices.length !== 1 ? 's' : ''})
                </span>
              </div>
              <button
                onClick={clearAllFilters}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* Content View Switching */}
          {viewMode === 'calendar' ? (
            <CalendarView
              notices={notices}
              onOpenNotice={notice => setSelectedNoticeForDetails(notice)}
            />
          ) : viewMode === 'list' ? (
            displayedNotices.length > 0 ? (
              <ListView
                notices={displayedNotices}
                onOpenDetails={notice => setSelectedNoticeForDetails(notice)}
                onEdit={notice => setSelectedNoticeForEdit(notice)}
                onDelete={id => deleteNotice(id)}
                onToggleFavorite={id => toggleFavorite(id)}
                onToggleCompleted={id => toggleCompleted(id)}
                onAddReminder={notice => handleOpenRemindersForNotice(notice)}
                onShowToast={addToast}
              />
            ) : (
              <EmptyState
                onOpenAIModal={() => setIsAIModalOpen(true)}
                onResetDemo={resetToDemo}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearAllFilters}
              />
            )
          ) : (
            /* Grid View */
            displayedNotices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {displayedNotices.map(notice => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    searchQuery={searchQuery}
                    onOpenDetails={n => setSelectedNoticeForDetails(n)}
                    onEdit={n => setSelectedNoticeForEdit(n)}
                    onDelete={id => deleteNotice(id)}
                    onToggleFavorite={id => toggleFavorite(id)}
                    onToggleCompleted={id => toggleCompleted(id)}
                    onAddReminder={n => handleOpenRemindersForNotice(n)}
                    onShowToast={addToast}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                onOpenAIModal={() => setIsAIModalOpen(true)}
                onResetDemo={resetToDemo}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearAllFilters}
              />
            )
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      {/* 1. Smart AI Notice Extractor Modal */}
      <SmartAIInputModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSaveBatch={drafts => addNoticesBatch(drafts)}
        existingNotices={notices}
        geminiApiKey={settings.geminiApiKey}
        onShowToast={addToast}
      />

      {/* 2. Weekly AI Summary Modal */}
      <WeeklySummaryModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        notices={notices}
        userName={settings.userName}
        onOpenNotice={n => {
          setIsWeeklyModalOpen(false);
          setSelectedNoticeForDetails(n);
        }}
        onShowToast={addToast}
      />

      {/* 3. Notice Details Modal */}
      <NoticeDetailModal
        notice={selectedNoticeForDetails}
        onClose={() => setSelectedNoticeForDetails(null)}
        onEdit={n => {
          setSelectedNoticeForDetails(null);
          setSelectedNoticeForEdit(n);
        }}
        onDelete={id => deleteNotice(id)}
        onToggleFavorite={id => toggleFavorite(id)}
        onToggleCompleted={id => toggleCompleted(id)}
        onAddReminder={n => handleOpenRemindersForNotice(n)}
        onShowToast={addToast}
      />

      {/* 4. Notice Edit / Manual Add Modal */}
      <NoticeEditModal
        notice={selectedNoticeForEdit}
        isOpen={selectedNoticeForEdit !== null || isManualAddOpen}
        onClose={() => {
          setSelectedNoticeForEdit(null);
          setIsManualAddOpen(false);
        }}
        onSave={updated => updateNotice(updated)}
        onCreateNew={newData => addNotice(newData)}
        onShowToast={addToast}
      />

      {/* 5. Reminders Modal */}
      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={reminders}
        notices={notices}
        initialNotice={reminderTargetNotice}
        onAddReminder={data => addReminder(data)}
        onToggleCompleted={id => toggleReminderCompleted(id)}
        onDeleteReminder={id => deleteReminder(id)}
        onShowToast={addToast}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={s => setSettings(s)}
        onResetDemo={resetToDemo}
        onShowToast={addToast}
      />

      {/* 7. Toast Notifications Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

interface EmptyStateProps {
  onOpenAIModal: () => void;
  onResetDemo: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenAIModal,
  onResetDemo,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="py-16 px-4 text-center rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 shadow-xs max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-4 shadow-sm">
        <Inbox className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {hasActiveFilters ? 'No Matching Announcements' : 'Campus Feed is Clean!'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 max-w-xs mx-auto leading-relaxed">
        {hasActiveFilters
          ? 'Try adjusting your search keywords, category filters, or date range.'
          : 'Paste an announcement forward or load demo campus events to see them organized.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {hasActiveFilters ? (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 transition"
          >
            Clear All Filters
          </button>
        ) : (
          <>
            <button
              onClick={onOpenAIModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 transition"
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>Extract Notice with AI</span>
            </button>
            <button
              onClick={onResetDemo}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
            >
              Load Demo Notices
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

