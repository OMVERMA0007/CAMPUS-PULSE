import { Category, PriorityLevel } from '../types';

export const CATEGORY_COLORS: Record<
  Category,
  { bg: string; text: string; border: string; glow: string; darkBg: string }
> = {
  Academic: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    darkBg: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.25)',
  },
  Exams: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    darkBg: 'dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.25)',
  },
  Workshops: {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    darkBg: 'dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.25)',
  },
  Hackathons: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    darkBg: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.25)',
  },
  Competitions: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    darkBg: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  'Cultural Events': {
    bg: 'bg-pink-50 text-pink-700 border-pink-200',
    darkBg: 'dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/30',
    glow: 'rgba(236, 72, 153, 0.25)',
  },
  Sports: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkBg: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.25)',
  },
  'Placement & Internships': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    darkBg: 'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'rgba(99, 102, 241, 0.25)',
  },
  'Important Notices': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    darkBg: 'dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/30',
    glow: 'rgba(249, 115, 22, 0.25)',
  },
  Other: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    darkBg: 'dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    glow: 'rgba(100, 116, 139, 0.25)',
  },
};

export const PRIORITY_STYLES: Record<
  PriorityLevel,
  { label: string; bg: string; dot: string; border: string; glow: string }
> = {
  URGENT: {
    label: 'URGENT',
    bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500 animate-pulse',
    border: 'border-rose-500/40',
    glow: 'shadow-rose-500/10 ring-1 ring-rose-500/20',
  },
  TODAY: {
    label: 'TODAY',
    bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500 animate-ping',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/10 ring-1 ring-emerald-500/20',
  },
  UPCOMING: {
    label: 'UPCOMING',
    bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-500',
    border: 'border-indigo-500/30',
    glow: '',
  },
  NORMAL: {
    label: 'ACTIVE',
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
    glow: '',
  },
  EXPIRED: {
    label: 'EXPIRED',
    bg: 'bg-slate-500/10 text-slate-400 dark:text-slate-500 border-slate-500/10 line-through opacity-75',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
    glow: '',
  },
};

