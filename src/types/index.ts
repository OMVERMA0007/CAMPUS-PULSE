export type Category =
  | 'Academic'
  | 'Exams'
  | 'Workshops'
  | 'Hackathons'
  | 'Competitions'
  | 'Cultural Events'
  | 'Sports'
  | 'Placement & Internships'
  | 'Important Notices'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Academic',
  'Exams',
  'Workshops',
  'Hackathons',
  'Competitions',
  'Cultural Events',
  'Sports',
  'Placement & Internships',
  'Important Notices',
  'Other',
];

export type PriorityLevel = 'URGENT' | 'TODAY' | 'UPCOMING' | 'NORMAL' | 'EXPIRED';

export type SourceType = 'WhatsApp' | 'Email' | 'Notice Board' | 'Poster' | 'Manual';

export interface CampusNotice {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string; // YYYY-MM-DD or 'Not specified'
  time: string; // e.g. '10:00 AM' or 'Not specified'
  venue: string; // e.g. 'Seminar Hall 3' or 'Not specified'
  registrationDeadline: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm or 'Not specified'
  registrationLink?: string;
  organizer?: string;
  tags: string[];
  priority: PriorityLevel;
  source: SourceType;
  rawText?: string;
  isFavorite: boolean;
  isCompleted: boolean;
  isDemoSample?: boolean;
  createdAt: string;
  updatedAt: string;
  extractionEngine?: 'Gemini AI' | 'Smart Local Parser';
}

export interface ExtractedNoticeDraft {
  title: string;
  category: Category;
  date: string;
  time: string;
  venue: string;
  registrationDeadline: string;
  description: string;
  priority: PriorityLevel;
  tags: string[];
  organizer?: string;
  registrationLink?: string;
  confidenceScore?: number;
}

export interface ReminderItem {
  id: string;
  noticeId: string;
  noticeTitle: string;
  reminderDateTime: string; // ISO string
  note?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface AppSettings {
  geminiApiKey: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
  userName: string;
  userRole: string;
}

export interface WeeklySummaryData {
  headline: string;
  summaryText: string;
  urgentDeadlines: Array<{
    title: string;
    deadline: string;
    category: Category;
    hoursLeft?: number;
  }>;
  todayEvents: Array<{
    title: string;
    time: string;
    venue: string;
    category: Category;
  }>;
  upcomingHighlights: Array<{
    title: string;
    date: string;
    category: Category;
    description: string;
  }>;
  opportunities: Array<{
    title: string;
    type: string;
    deadline: string;
    link?: string;
  }>;
  academicAndExams: Array<{
    title: string;
    date: string;
    priority: string;
  }>;
  generatedAt: string;
}

export type ViewMode = 'grid' | 'list' | 'calendar';
export type FilterSortOption = 'soonest' | 'latest' | 'deadline' | 'priority' | 'alpha';

