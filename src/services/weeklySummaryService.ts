import { CampusNotice, WeeklySummaryData, Category } from '../types';
import { parseISO, isToday, isThisWeek, isFuture, differenceInHours, isValid, format } from 'date-fns';

export function generateWeeklySummary(
  notices: CampusNotice[],
  userName: string = 'Alex'
): WeeklySummaryData {
  const now = new Date();

  // Filter non-expired and active notices
  const activeNotices = notices.filter(n => {
    if (n.isCompleted) return false;

    // Check if event date or deadline is not expired
    if (n.date && n.date !== 'Not specified') {
      try {
        const d = parseISO(`${n.date}T23:59:59`);
        if (isValid(d) && d < now && !isToday(d)) {
          return false;
        }
      } catch {
        // keep
      }
    }
    return true;
  });

  // 1. Urgent deadlines (< 48 hours)
  const urgentDeadlines: WeeklySummaryData['urgentDeadlines'] = [];
  for (const n of activeNotices) {
    if (n.registrationDeadline && n.registrationDeadline !== 'Not specified') {
      try {
        const dl = parseISO(n.registrationDeadline.includes('T') ? n.registrationDeadline : `${n.registrationDeadline}T23:59:59`);
        if (isValid(dl) && dl >= now) {
          const hoursLeft = differenceInHours(dl, now);
          if (hoursLeft <= 48) {
            urgentDeadlines.push({
              title: n.title,
              deadline: n.registrationDeadline,
              category: n.category,
              hoursLeft,
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // 2. Activities scheduled for today
  const todayEvents: WeeklySummaryData['todayEvents'] = [];
  for (const n of activeNotices) {
    if (n.date && n.date !== 'Not specified') {
      try {
        const d = parseISO(`${n.date}T00:00:00`);
        if (isValid(d) && isToday(d)) {
          todayEvents.push({
            title: n.title,
            time: n.time || 'All Day',
            venue: n.venue || 'Campus',
            category: n.category,
          });
        }
      } catch {
        // ignore
      }
    }
  }

  // 3. Upcoming Highlights this week
  const upcomingHighlights: WeeklySummaryData['upcomingHighlights'] = [];
  for (const n of activeNotices) {
    if (n.date && n.date !== 'Not specified') {
      try {
        const d = parseISO(`${n.date}T00:00:00`);
        if (isValid(d) && isFuture(d) && isThisWeek(d, { weekStartsOn: 1 })) {
          upcomingHighlights.push({
            title: n.title,
            date: n.date,
            category: n.category,
            description: n.description,
          });
        }
      } catch {
        // ignore
      }
    }
  }

  // 4. Academic & Exam Alerts
  const academicAndExams: WeeklySummaryData['academicAndExams'] = [];
  for (const n of activeNotices) {
    if (n.category === 'Exams' || n.category === 'Academic') {
      academicAndExams.push({
        title: n.title,
        date: n.date,
        priority: n.priority,
      });
    }
  }

  // 5. Opportunities (Hackathons, Workshops, Placements)
  const opportunities: WeeklySummaryData['opportunities'] = [];
  for (const n of activeNotices) {
    if (['Hackathons', 'Workshops', 'Placement & Internships', 'Competitions'].includes(n.category)) {
      opportunities.push({
        title: n.title,
        type: n.category,
        deadline: n.registrationDeadline,
        link: n.registrationLink,
      });
    }
  }

  // Generate headline & student-friendly narrative
  let headline = `Here's your smart weekly briefing, ${userName}!`;
  let summaryText = '';

  if (urgentDeadlines.length > 0) {
    headline = `⚠️ ${urgentDeadlines.length} Urgent Deadline${urgentDeadlines.length > 1 ? 's' : ''} Require Immediate Attention!`;
    summaryText += `You have **${urgentDeadlines.length} critical deadline${urgentDeadlines.length > 1 ? 's' : ''} closing within 48 hours**! `;
  } else {
    summaryText += `Your upcoming schedule is well-organized with no imminent emergency deadlines. `;
  }

  if (todayEvents.length > 0) {
    summaryText += `There ${todayEvents.length === 1 ? 'is' : 'are'} **${todayEvents.length} active event${todayEvents.length > 1 ? 's' : ''} happening today**. `;
  }

  if (opportunities.length > 0) {
    summaryText += `Plus, **${opportunities.length} high-impact career and skill opportunities** (including hackathons and workshops) are currently active.`;
  }

  return {
    headline,
    summaryText,
    urgentDeadlines,
    todayEvents,
    upcomingHighlights,
    opportunities,
    academicAndExams,
    generatedAt: format(now, "EEE, MMM d 'at' h:mm a"),
  };
}

