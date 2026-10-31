import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Share2,
  Download,
  Edit,
  Trash2,
  Bell,
  ExternalLink,
  Flame,
  MessageCircle,
  Shield,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';
import { CampusNotice } from '../types';
import { formatDateDisplay, formatDeadlineDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS, PRIORITY_STYLES } from '../utils/uiColors';
import { exportNoticeToICS, formatNoticeForWhatsApp } from '../services/calendarService';

interface NoticeDetailModalProps {
  notice: CampusNotice | null;
  onClose: () => void;
  onEdit: (notice: CampusNotice) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onAddReminder: (notice: CampusNotice) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleCompleted,
  onAddReminder,
  onShowToast,
}) => {
  if (!notice) return null;

  const catColor = CATEGORY_COLORS[notice.category];
  const priorityStyle = PRIORITY_STYLES[notice.priority];
  const deadlineInfo = formatDeadlineDisplay(notice.registrationDeadline);

  const handleCopyWhatsApp = () => {
    const text = formatNoticeForWhatsApp(notice);
    navigator.clipboard.writeText(text);
    onShowToast('Copied to Clipboard!', 'Ready to paste into WhatsApp groups or chats.', 'success');
  };

  const handleExportICS = () => {
    exportNoticeToICS(notice);
    onShowToast('Calendar Download Started', `${notice.title}.ics downloaded!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${catColor.bg} ${catColor.darkBg}`}
            >
              {notice.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              <span>{priorityStyle.label}</span>
            </span>
            {notice.isDemoSample && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Demo Sample
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {notice.title}
            </h2>
            {notice.organizer && (
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                Organized by: {notice.organizer}
              </p>
            )}
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Event Date</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDateDisplay(notice.date)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Starting Time</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {notice.time || 'Not specified'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Venue / Location</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {notice.venue || 'Not specified'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Registration Deadline</div>
                <div
                  className={`font-bold ${
                    deadlineInfo.isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {deadlineInfo.text}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Announcement Description
            </h4>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {notice.description}
            </div>
          </div>

          {/* Registration Link Action Button */}
          {notice.registrationLink && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Official Registration Portal
                </div>
                <div className="text-xs text-slate-500 truncate max-w-sm">
                  {notice.registrationLink}
                </div>
              </div>
              <a
                href={notice.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm"
              >
                <span>Open Registration</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Tags */}
          {notice.tags && notice.tags.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tags & Topic Keywords
              </div>
              <div className="flex flex-wrap gap-1.5">
                {notice.tags.map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text Snippet (if available) */}
          {notice.rawText && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Original Unstructured Source ({notice.source})</span>
              </h4>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {notice.rawText}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(notice.id)}
              className={`p-2 rounded-xl border transition ${
                notice.isFavorite
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${notice.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => onToggleCompleted(notice.id)}
              className={`p-2 rounded-xl border transition ${
                notice.isCompleted
                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle Completed"
            >
              <CheckCircle2 className={`w-4 h-4 ${notice.isCompleted ? 'fill-emerald-500 text-white' : ''}`} />
            </button>

            <button
              onClick={() => onAddReminder(notice)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Set Reminder"
            >
              <Bell className="w-4 h-4 text-purple-500" />
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Share for WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
            </button>

            <button
              onClick={handleExportICS}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Download iCal (.ics)"
            >
              <Download className="w-4 h-4 text-indigo-500" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(notice);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${notice.title}"?`)) {
                  onDelete(notice.id);
                  onClose();
                  onShowToast('Notice Deleted', 'Removed from your campus pulse feed.', 'info');
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

