import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Trash2,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  BellRing,
} from 'lucide-react';
import { ReminderItem, CampusNotice } from '../types';
import { notificationService } from '../services/notificationService';
import { format, parseISO, isValid } from 'date-fns';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ReminderItem[];
  notices: CampusNotice[];
  initialNotice?: CampusNotice | null;
  onAddReminder: (data: Omit<ReminderItem, 'id' | 'createdAt' | 'isCompleted'>) => void;
  onToggleCompleted: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  reminders,
  notices,
  initialNotice,
  onAddReminder,
  onToggleCompleted,
  onDeleteReminder,
  onShowToast,
}) => {
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>(
    initialNotice?.id || (notices[0]?.id ?? '')
  );
  const [reminderDateTime, setReminderDateTime] = useState<string>(() => {
    // default 2 hours from now
    const d = new Date(Date.now() + 2 * 3600000);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  });
  const [customNote, setCustomNote] = useState('');
  const [hasBrowserPerm, setHasBrowserPerm] = useState(() => notificationService.hasPermission());

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setHasBrowserPerm(granted);
    if (granted) {
      onShowToast('Notifications Enabled!', 'You will receive desktop alerts for campus deadlines.', 'success');
    } else {
      onShowToast('Permission Not Granted', 'Browser notifications were blocked or dismissed.', 'warning');
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const notice = notices.find(n => n.id === selectedNoticeId);
    if (!notice) {
      onShowToast('Notice Required', 'Please choose an announcement.', 'warning');
      return;
    }

    onAddReminder({
      noticeId: notice.id,
      noticeTitle: notice.title,
      reminderDateTime,
      note: customNote.trim() || undefined,
    });

    onShowToast('Reminder Set', `Alert scheduled for ${notice.title}.`, 'success');
    setCustomNote('');
  };

  const pendingReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Campus Reminders & Alarms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Never forget an exam submission or registration window
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Notification Permission Banner */}
          {!hasBrowserPerm && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Bell className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Enable desktop notifications for real-time deadline popups.</span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-500 transition text-xs shrink-0"
              >
                Allow
              </button>
            </div>
          )}

          {/* Create Reminder Form */}
          <form
            onSubmit={handleCreateReminder}
            className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3.5"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-500" />
              <span>Schedule New Reminder</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Select Notice
              </label>
              <select
                value={selectedNoticeId}
                onChange={e => setSelectedNoticeId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500"
              >
                {notices.map(n => (
                  <option key={n.id} value={n.id}>
                    [{n.category}] {n.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  <span>Reminder Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reminderDateTime}
                  onChange={e => setReminderDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="e.g. Bring college ID and laptop"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Set Alert</span>
              </button>
            </div>
          </form>

          {/* Pending Reminders List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Scheduled Alarms ({pendingReminders.length})</span>
            </h3>

            {pendingReminders.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No active reminders set.</p>
            ) : (
              <div className="space-y-2">
                {pendingReminders.map(r => {
                  let formattedDate = r.reminderDateTime;
                  try {
                    const parsed = parseISO(r.reminderDateTime);
                    if (isValid(parsed)) {
                      formattedDate = format(parsed, 'EEE, MMM d, yyyy @ h:mm a');
                    }
                  } catch {
                    // ignore
                  }

                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <button
                          onClick={() => onToggleCompleted(r.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                          title="Mark reminder completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {r.noticeTitle}
                          </div>
                          <div className="text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate}</span>
                          </div>
                          {r.note && (
                            <div className="text-slate-500 text-[11px] mt-0.5">Note: {r.note}</div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteReminder(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition shrink-0"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Completed Reminders ({completedReminders.length})
              </h3>
              <div className="space-y-1.5 opacity-60">
                {completedReminders.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="line-through text-slate-500 truncate min-w-0 pr-2">
                      {r.noticeTitle}
                    </div>
                    <button
                      onClick={() => onDeleteReminder(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

