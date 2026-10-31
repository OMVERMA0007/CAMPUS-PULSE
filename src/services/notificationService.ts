import { ReminderItem } from '../types';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  sendNotification(title: string, options?: NotificationOptions): void {
    if (this.hasPermission()) {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (e) {
        console.warn('Could not trigger native browser notification:', e);
      }
    }
  },

  checkDueReminders(
    reminders: ReminderItem[],
    onTrigger: (reminder: ReminderItem) => void
  ): ReminderItem[] {
    const now = new Date().getTime();
    let updated = false;

    const newReminders = reminders.map(r => {
      if (!r.isCompleted) {
        const dueTime = new Date(r.reminderDateTime).getTime();
        if (dueTime <= now) {
          updated = true;
          onTrigger(r);
          return { ...r, isCompleted: true };
        }
      }
      return r;
    });

    return updated ? newReminders : reminders;
  },
};

