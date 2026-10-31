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
  Flame,
} from 'lucide-react';
import { CampusNotice } from '../types';
import { formatDateDisplay, formatDeadlineDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS, PRIORITY_STYLES } from '../utils/uiColors';
import { exportNoticeToICS, formatNoticeForWhatsApp } from '../services/calendarService';

interface ListViewProps {
  notices: CampusNotice[];
  onOpenDetails: (notice: CampusNotice) => void;
  onEdit: (notice: CampusNotice) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onAddReminder: (notice: CampusNotice) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ListView: React.FC<ListViewProps> = ({
  notices,
  onOpenDetails,
  onToggleFavorite,
  onToggleCompleted,
  onAddReminder,
  onShowToast,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 text-slate-400 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4 w-10"></th>
              <th className="py-3.5 px-4">Event / Announcement</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Venue</th>
              <th className="py-3.5 px-4">Deadline</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {notices.map(notice => {
              const catColor = CATEGORY_COLORS[notice.category];
              const priorityStyle = PRIORITY_STYLES[notice.priority];
              const deadline = formatDeadlineDisplay(notice.registrationDeadline);

              return (
                <tr
                  key={notice.id}
                  onClick={() => onOpenDetails(notice)}
                  className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition ${
                    notice.isCompleted ? 'opacity-50 line-through' : ''
                  }`}
                >
                  {/* Star */}
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(notice.id)}
                      className={`p-1 rounded transition ${
                        notice.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${notice.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                  </td>

                  {/* Title & Priority */}
                  <td className="py-3 px-4 max-w-xs sm:max-w-md">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityStyle.dot}`} />
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {notice.title}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold border ${catColor.bg} ${catColor.darkBg}`}>
                      {notice.category}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                    <div>{formatDateDisplay(notice.date)}</div>
                    {notice.time && notice.time !== 'Not specified' && (
                      <div className="text-[11px] text-slate-400">{notice.time}</div>
                    )}
                  </td>

                  {/* Venue */}
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-36">
                    {notice.venue || 'Not specified'}
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        deadline.isUrgent
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {deadline.text}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          const text = formatNoticeForWhatsApp(notice);
                          navigator.clipboard.writeText(text);
                          onShowToast('Copied for WhatsApp', 'Ready to paste in chat.', 'success');
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-500 transition"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          exportNoticeToICS(notice);
                          onShowToast('Calendar Exported', `${notice.title}.ics downloaded`, 'success');
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-500 transition"
                        title="Download .ics"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleCompleted(notice.id)}
                        className={`p-1 transition ${
                          notice.isCompleted ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                        }`}
                        title="Toggle completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

