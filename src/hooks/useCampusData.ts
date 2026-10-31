import { useState, useEffect, useMemo, useCallback } from 'react';
import { CampusNotice, ReminderItem, AppSettings, Category, PriorityLevel, ViewMode, FilterSortOption } from '../types';
import { storageService } from '../services/storageService';
import { computeDynamicPriority } from '../utils/dateUtils';
import { notificationService } from '../services/notificationService';
import confetti from 'canvas-confetti';

export function useCampusData() {
  const [notices, setNotices] = useState<CampusNotice[]>(() => storageService.loadNotices());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storageService.loadReminders());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<FilterSortOption>('soonest');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Sync theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist notices
  useEffect(() => {
    storageService.saveNotices(notices);
  }, [notices]);

  // Persist reminders
  useEffect(() => {
    storageService.saveReminders(reminders);
  }, [reminders]);

  // Persist settings
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Periodic reminder checking
  useEffect(() => {
    const interval = setInterval(() => {
      setReminders(prev => {
        return notificationService.checkDueReminders(prev, dueReminder => {
          notificationService.sendNotification(`Campus Pulse Reminder: ${dueReminder.noticeTitle}`, {
            body: dueReminder.note || 'You have an upcoming campus event or deadline scheduled right now!',
          });
        });
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Update dynamic priorities dynamically
  const processedNotices = useMemo(() => {
    return notices.map(n => ({
      ...n,
      priority: computeDynamicPriority(n),
    }));
  }, [notices]);

  // Filtered & Sorted notices
  const filteredNotices = useMemo(() => {
    return processedNotices.filter(notice => {
      // Completed filter
      if (!showCompleted && notice.isCompleted) return false;

      // Favorites filter
      if (favoritesOnly && !notice.isFavorite) return false;

      // Category filter
      if (selectedCategory !== 'All' && notice.category !== selectedCategory) return false;

      // Priority filter
      if (selectedPriority !== 'All' && notice.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notice.title.toLowerCase().includes(query);
        const matchesDesc = notice.description.toLowerCase().includes(query);
        const matchesVenue = notice.venue.toLowerCase().includes(query);
        const matchesCategory = notice.category.toLowerCase().includes(query);
        const matchesTags = notice.tags.some(t => t.toLowerCase().includes(query));
        const matchesOrganizer = notice.organizer?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesCategory && !matchesTags && !matchesOrganizer) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'soonest') {
        const da = a.date !== 'Not specified' ? a.date : '9999-99-99';
        const db = b.date !== 'Not specified' ? b.date : '9999-99-99';
        return da.localeCompare(db);
      }
      if (sortOption === 'latest') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sortOption === 'deadline') {
        const dla = a.registrationDeadline !== 'Not specified' ? a.registrationDeadline : '9999-99-99';
        const dlb = b.registrationDeadline !== 'Not specified' ? b.registrationDeadline : '9999-99-99';
        return dla.localeCompare(dlb);
      }
      if (sortOption === 'priority') {
        const rank: Record<PriorityLevel, number> = {
          URGENT: 0,
          TODAY: 1,
          UPCOMING: 2,
          NORMAL: 3,
          EXPIRED: 4,
        };
        return rank[a.priority] - rank[b.priority];
      }
      if (sortOption === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [processedNotices, searchQuery, selectedCategory, selectedPriority, favoritesOnly, showCompleted, sortOption]);

  // Actions
  const addNotice = useCallback((noticeData: Omit<CampusNotice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotice: CampusNotice = {
      ...noticeData,
      id: `notice-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotices(prev => [newNotice, ...prev]);

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8B5CF6', '#6366F1', '#38BDF8'],
    });

    return newNotice;
  }, []);

  const addNoticesBatch = useCallback((batch: Array<Omit<CampusNotice, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const created = batch.map((noticeData, idx) => ({
      ...noticeData,
      id: `notice-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setNotices(prev => [...created, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#8B5CF6', '#EC4899', '#38BDF8', '#10B981'],
    });

    return created;
  }, []);

  const updateNotice = useCallback((updated: CampusNotice) => {
    setNotices(prev =>
      prev.map(n => (n.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : n))
    );
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    setReminders(prev => prev.filter(r => r.noticeId !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setNotices(prev =>
      prev.map(n => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setNotices(prev =>
      prev.map(n => {
        if (n.id === id) {
          const nextState = !n.isCompleted;
          if (nextState) {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.6 },
            });
          }
          return { ...n, isCompleted: nextState };
        }
        return n;
      })
    );
  }, []);

  const addReminder = useCallback((reminderData: Omit<ReminderItem, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newReminder: ReminderItem = {
      ...reminderData,
      id: `rem-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [newReminder, ...prev]);
    return newReminder;
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleReminderCompleted = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  }, []);

  const resetToDemo = useCallback(() => {
    const samples = storageService.resetToSampleData();
    setNotices(samples);
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = processedNotices.length;
    const urgent = processedNotices.filter(n => n.priority === 'URGENT' && !n.isCompleted).length;
    const today = processedNotices.filter(n => n.priority === 'TODAY' && !n.isCompleted).length;
    const upcoming = processedNotices.filter(n => n.priority === 'UPCOMING' && !n.isCompleted).length;
    const favorites = processedNotices.filter(n => n.isFavorite).length;
    const pendingReminders = reminders.filter(r => !r.isCompleted).length;

    return { total, urgent, today, upcoming, favorites, pendingReminders };
  }, [processedNotices, reminders]);

  return {
    notices: processedNotices,
    filteredNotices,
    reminders,
    settings,
    stats,
    // Filters
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
    // Operations
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
  };
}

