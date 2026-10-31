import { CampusNotice, ReminderItem, AppSettings } from '../types';
import { SAMPLE_NOTICES } from '../data/sampleNotices';

const STORAGE_KEYS = {
  NOTICES: 'campus_pulse_notices_v1',
  REMINDERS: 'campus_pulse_reminders_v1',
  SETTINGS: 'campus_pulse_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  notificationsEnabled: true,
  theme: 'dark',
  userName: 'Alex Rivera',
  userRole: 'Computer Science, Class of 2027',
};

export const storageService = {
  loadNotices(): CampusNotice[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (data) {
        return JSON.parse(data);
      }
      // First run: save and return sample notices
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(SAMPLE_NOTICES));
      return SAMPLE_NOTICES;
    } catch (e) {
      console.error('Error loading notices from localStorage:', e);
      return SAMPLE_NOTICES;
    }
  },

  saveNotices(notices: CampusNotice[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch (e) {
      console.error('Error saving notices to localStorage:', e);
    }
  },

  resetToSampleData(): CampusNotice[] {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(SAMPLE_NOTICES));
      return SAMPLE_NOTICES;
    } catch (e) {
      console.error('Error resetting to sample data:', e);
      return SAMPLE_NOTICES;
    }
  },

  loadReminders(): ReminderItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading reminders:', e);
      return [];
    }
  },

  saveReminders(reminders: ReminderItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.error('Error saving reminders:', e);
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  exportAllData(): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      notices: this.loadNotices(),
      reminders: this.loadReminders(),
      settings: this.loadSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.notices && Array.isArray(parsed.notices)) {
        this.saveNotices(parsed.notices);
        if (parsed.reminders && Array.isArray(parsed.reminders)) {
          this.saveReminders(parsed.reminders);
        }
        return {
          success: true,
          message: `Successfully restored ${parsed.notices.length} notices!`,
          count: parsed.notices.length,
        };
      }
      return { success: false, message: 'Invalid data format: Missing notices array.' };
    } catch (e) {
      return { success: false, message: `Failed to import JSON: ${(e as Error).message}` };
    }
  },

  /**
   * Duplicate notice detection: checks if a title or text closely matches an existing notice
   */
  findPossibleDuplicates(
    title: string,
    existingNotices: CampusNotice[],
    date?: string
  ): CampusNotice[] {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    const targetWords = new Set(clean(title).split(/\s+/).filter(w => w.length > 3));

    if (targetWords.size === 0) return [];

    return existingNotices.filter(notice => {
      // If exact date match + high word overlap
      const noticeWords = clean(notice.title).split(/\s+/).filter(w => w.length > 3);
      let common = 0;
      for (const w of noticeWords) {
        if (targetWords.has(w)) common++;
      }

      const similarity = common / Math.max(targetWords.size, noticeWords.length, 1);
      const isHighTextSimilarity = similarity >= 0.55;

      const isSameDateAndSimilar =
        date &&
        date !== 'Not specified' &&
        notice.date === date &&
        similarity >= 0.35;

      return isHighTextSimilarity || isSameDateAndSimilar;
    });
  },
};

