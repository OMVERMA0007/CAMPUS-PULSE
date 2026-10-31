import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Share2,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Bell,
  Sparkles,
  ExternalLink,
  Flame,
  MessageCircle,
} from 'lucide-react';
import { CampusNotice } from '../types';
import { formatDateDisplay, formatDeadlineDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS, PRIORITY_STYLES } from '../utils/uiColors';
import { exportNoticeToICS, formatNoticeForWhatsApp } from '../services/calendarService';

interface NoticeCardProps {
  notice: CampusNotice;
  searchQuery?: string;
  onOpenDetails: (notice: CampusNotice) => void;
  onEdit: (notice: CampusNotice) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onAddReminder: (notice: CampusNotice) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  searchQuery,
  onOpenDetails,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleCompleted,
  onAddReminder,
  onShowToast,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const catColor = CATEGORY_COLORS[notice.category];
  const priorityStyle = PRIORITY_STYLES[notice.priority];
  const deadlineInfo = formatDeadlineDisplay(notice.registrationDeadline);

  const handleCopyWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatNoticeForWhatsApp(notice);
    navigator.clipboard.writeText(text);
    onShowToast('Copied to clipboard!', 'Formatted notice is ready to paste into WhatsApp.', 'success');
  };

  const handleExportICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportNoticeToICS(notice);
    onShowToast('Calendar File Downloaded', `${notice.title}.ics ready for Google or Apple Calendar!`, 'success');
  };

  return (
    <div
      onClick={() => onOpenDetails(notice)}
      className={`group relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 cursor-pointer backdrop-blur-sm ${
        notice.isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
          : notice.priority === 'URGENT'
          ? 'bg-white dark:bg-slate-900/80 border-rose-500/30 hover:border-rose-500/60 shadow-xs hover:shadow-lg shadow-rose-950/10'
          : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 shadow-xs hover:shadow-lg shadow-purple-950/5'
      }`}
    >
      <div>
        {/* Top Badges & Actions Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Badge */}
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${catColor.bg} ${catColor.darkBg}`}
            >
              {notice.category}
            </span>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle.bg} ${priorityStyle.glow}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              <span>{priorityStyle.label}</span>
            </span>

            {/* Demo Sample Badge */}
            {notice.isDemoSample && (
              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Demo
              </span>
            )}
          </div>

          {/* Quick Icon Actions */}
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(notice.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                notice.isFavorite
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={notice.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${notice.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Complete Checkbox */}
            <button
              onClick={() => onToggleCompleted(notice.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                notice.isCompleted
                  ? 'text-emerald-500 hover:bg-emerald-500/10'
                  : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={notice.isCompleted ? 'Mark as incomplete' : 'Mark as completed / attended'}
            >
              <CheckCircle2 className={`w-4 h-4 ${notice.isCompleted ? 'fill-emerald-500 text-white' : ''}`} />
            </button>

            {/* More Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onAddReminder(notice);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <Bell className="w-3.5 h-3.5 text-purple-500" />
                      <span>Set Reminder</span>
                    </button>
                    <button
                      onClick={e => {
                        setMenuOpen(false);
                        handleCopyWhatsApp(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Share for WhatsApp</span>
                    </button>
                    <button
                      onClick={e => {
                        setMenuOpen(false);
                        handleExportICS(e);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Export (.ics)</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(notice);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-500" />
                      <span>Edit Notice</span>
                    </button>
                    <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(notice.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug line-clamp-2 mb-2 ${
            notice.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {notice.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {notice.description}
        </p>

        {/* Event Key Details: Date, Time, Venue */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {formatDateDisplay(notice.date)}
            </span>
            {notice.time && notice.time !== 'Not specified' && (
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                • <Clock className="w-3 h-3" /> {notice.time}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{notice.venue || 'Not specified'}</span>
          </div>

          {/* Registration Deadline Alert */}
          {notice.registrationDeadline && notice.registrationDeadline !== 'Not specified' && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium border-t border-slate-200/50 dark:border-slate-800/50">
              <span
                className={`flex items-center gap-1 ${
                  deadlineInfo.isUrgent
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : deadlineInfo.isExpired
                    ? 'text-slate-400 line-through'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {deadlineInfo.isUrgent && <Flame className="w-3 h-3 text-rose-500 animate-pulse" />}
                {deadlineInfo.text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Tags & Quick Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
            {notice.source}
          </span>
          {notice.tags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 truncate max-w-20"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleCopyWhatsApp}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportICS}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            title="Export iCalendar (.ics)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

