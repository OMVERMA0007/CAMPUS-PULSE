import React, { useMemo } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Calendar,
  Clock,
  BookOpen,
  Trophy,
  Copy,
  Printer,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CampusNotice } from '../types';
import { generateWeeklySummary } from '../services/weeklySummaryService';
import { formatDateDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS } from '../utils/uiColors';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: CampusNotice[];
  userName: string;
  onOpenNotice: (notice: CampusNotice) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  notices,
  userName,
  onOpenNotice,
  onShowToast,
}) => {
  const summary = useMemo(() => {
    return generateWeeklySummary(notices, userName);
  }, [notices, userName]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const lines = [
      `🎓 CAMPUS PULSE — WEEKLY BRIEFING`,
      `Generated for ${userName} on ${summary.generatedAt}`,
      `---------------------------------------`,
      summary.headline,
      summary.summaryText,
      '',
    ];

    if (summary.urgentDeadlines.length > 0) {
      lines.push('🚨 URGENT DEADLINES (< 48 HOURS):');
      summary.urgentDeadlines.forEach(u => {
        lines.push(`• ${u.title} (Deadline: ${u.deadline})`);
      });
      lines.push('');
    }

    if (summary.todayEvents.length > 0) {
      lines.push("📅 HAPPENING TODAY ON CAMPUS:");
      summary.todayEvents.forEach(t => {
        lines.push(`• ${t.title} - ${t.time} at ${t.venue}`);
      });
      lines.push('');
    }

    if (summary.academicAndExams.length > 0) {
      lines.push('📚 EXAMS & ACADEMIC ALERTS:');
      summary.academicAndExams.forEach(a => {
        lines.push(`• ${a.title} (Date: ${a.date})`);
      });
      lines.push('');
    }

    if (summary.opportunities.length > 0) {
      lines.push('💡 WORKSHOPS & OPPORTUNITIES:');
      summary.opportunities.forEach(o => {
        lines.push(`• [${o.type}] ${o.title}`);
      });
      lines.push('');
    }

    lines.push('Never miss what matters on campus: Campus Pulse AI');

    navigator.clipboard.writeText(lines.join('\n'));
    onShowToast('Briefing Copied!', 'Weekly summary text is ready to paste into WhatsApp groups.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Campus Pulse Weekly Digest</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  AI Synthesized
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated {summary.generatedAt} • Tailored for {userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Copy Summary Text"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Executive Headline Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-slate-500/5 border border-purple-500/20">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {summary.summaryText}
            </p>
          </div>

          {/* Section 1: Urgent Deadlines */}
          {summary.urgentDeadlines.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  1. Imminent Deadlines (Next 48 Hours)
                </h4>
              </div>
              <div className="space-y-2">
                {summary.urgentDeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs"
                  >
                    <div className="font-semibold text-slate-900 dark:text-rose-200">
                      {item.title}
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                      {item.hoursLeft !== undefined ? `Due in ${item.hoursLeft}h` : 'Due soon'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Happening Today */}
          {summary.todayEvents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Activities Scheduled For Today
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {summary.todayEvents.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {t.title}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                      <span>{t.time}</span>
                      <span className="truncate">{t.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Exams & Academic Notices */}
          {summary.academicAndExams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  3. Upcoming Examinations & Academic Deadlines
                </h4>
              </div>
              <div className="space-y-2">
                {summary.academicAndExams.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Competitions, Hackathons & Workshops */}
          {summary.opportunities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-purple-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  4. Workshops, Competitions & Career Opportunities
                </h4>
              </div>
              <div className="space-y-2">
                {summary.opportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                        {opp.type}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {opp.title}
                      </span>
                    </div>
                    {opp.deadline && opp.deadline !== 'Not specified' && (
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">
                        RSVP: {formatDateDisplay(opp.deadline)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified: Expired events excluded</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Digest</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

