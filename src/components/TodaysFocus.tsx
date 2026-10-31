import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Timer,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { CampusNotice } from '../types';
import { getCountdown, formatDateDisplay } from '../utils/dateUtils';
import { CATEGORY_COLORS } from '../utils/uiColors';

interface TodaysFocusProps {
  notices: CampusNotice[];
  onOpenNotice: (notice: CampusNotice) => void;
  onOpenAIInput: () => void;
}

export const TodaysFocus: React.FC<TodaysFocusProps> = ({
  notices,
  onOpenNotice,
  onOpenAIInput,
}) => {
  // Find notices happening today
  const todayNotices = notices.filter(n => n.priority === 'TODAY' && !n.isCompleted);

  // Find urgent notices (<24h)
  const urgentNotices = notices.filter(n => n.priority === 'URGENT' && !n.isCompleted);

  // Find the closest approaching deadline
  const nextExpiringNotice = notices
    .filter(
      n =>
        !n.isCompleted &&
        n.registrationDeadline &&
        n.registrationDeadline !== 'Not specified'
    )
    .sort((a, b) => a.registrationDeadline.localeCompare(b.registrationDeadline))[0];

  // Live timer for closest deadline
  const [countdown, setCountdown] = useState(() =>
    nextExpiringNotice ? getCountdown(nextExpiringNotice.registrationDeadline) : null
  );

  useEffect(() => {
    if (!nextExpiringNotice) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(nextExpiringNotice.registrationDeadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextExpiringNotice]);

  if (todayNotices.length === 0 && urgentNotices.length === 0 && !nextExpiringNotice) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Critical Banner: "Your Attention Needed" */}
      {urgentNotices.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/60 border border-rose-500/30 shadow-lg shadow-rose-950/20 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Your Attention Needed
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                    {urgentNotices.length} Pending Actions
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Critical Deadlines Approaching Within 24 Hours!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {urgentNotices[0]?.title} requires registration or submission soon. Review and complete required actions to ensure you don't miss out.
                </p>
              </div>
            </div>

            {/* Live Countdown Widget */}
            {countdown && !countdown.isExpired && (
              <div className="shrink-0 flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-rose-500/30 text-white">
                <Timer className="w-5 h-5 text-rose-400 animate-spin" />
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Next Deadline In:
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-rose-300 tracking-wider">
                    {countdown.formatted}
                  </div>
                </div>
                <button
                  onClick={() => nextExpiringNotice && onOpenNotice(nextExpiringNotice)}
                  className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1 shadow-sm"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* "Today's Focus" Grid */}
      {todayNotices.length > 0 && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/20 border border-indigo-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>Today's Focus</span>
                <span className="text-xs font-normal text-slate-400 lowercase">
                  ({todayNotices.length} event{todayNotices.length > 1 ? 's' : ''} on campus)
                </span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayNotices.map(item => {
              const catColor = CATEGORY_COLORS[item.category];
              return (
                <div
                  key={item.id}
                  onClick={() => onOpenNotice(item)}
                  className="group flex items-start justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor.bg} ${catColor.darkBg}`}>
                        {item.category}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time || 'Today'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.venue || 'Campus'}</span>
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-purple-600/20 transition-all shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

