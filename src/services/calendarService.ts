import { CampusNotice } from '../types';

/**
 * Generates an RFC 5545 compliant .ics (iCalendar) file and triggers download
 */
export function exportNoticeToICS(notice: CampusNotice): void {
  const title = notice.title.replace(/[,;]/g, ' ');
  const description = (notice.description || '')
    .replace(/\n/g, '\\n')
    .replace(/[,;]/g, ' ');
  const venue = (notice.venue || 'Campus').replace(/[,;]/g, ' ');

  // Parse start date and time
  let dtStart = '';
  let dtEnd = '';

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (notice.date && notice.date !== 'Not specified') {
    const [y, m, d] = notice.date.split('-');
    // Parse time if available
    let startHour = 10;
    let startMinute = 0;

    if (notice.time && notice.time !== 'Not specified') {
      const timeMatch = notice.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (timeMatch) {
        let hrs = parseInt(timeMatch[1], 10);
        const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3]?.toUpperCase();

        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;

        startHour = hrs;
        startMinute = mins;
      }
    }

    dtStart = `${y}${m}${d}T${pad(startHour)}${pad(startMinute)}00`;
    // default 2 hour duration
    dtEnd = `${y}${m}${d}T${pad((startHour + 2) % 24)}${pad(startMinute)}00`;
  } else {
    // If no date, use tomorrow at 10 AM
    const tomorrow = new Date(now.getTime() + 86400000);
    const y = tomorrow.getFullYear();
    const m = pad(tomorrow.getMonth() + 1);
    const d = pad(tomorrow.getDate());
    dtStart = `${y}${m}${d}T100000`;
    dtEnd = `${y}${m}${d}T120000`;
  }

  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const uid = `${notice.id}-${Date.now()}@campuspulse.app`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Pulse//Smart Campus Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}${notice.registrationLink ? `\\nLink: ${notice.registrationLink}` : ''}`,
    `LOCATION:${venue}`,
    `CATEGORIES:${notice.category}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const safeFilename = notice.title.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${safeFilename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats notice details into a clean, emoji-rich snippet for WhatsApp sharing
 */
export function formatNoticeForWhatsApp(notice: CampusNotice): string {
  const lines: string[] = [
    `📢 *${notice.title.toUpperCase()}*`,
    `📌 *Category:* ${notice.category}`,
    `🗓 *Date:* ${notice.date}`,
    `⏰ *Time:* ${notice.time}`,
    `📍 *Venue:* ${notice.venue}`,
  ];

  if (notice.registrationDeadline && notice.registrationDeadline !== 'Not specified') {
    lines.push(`⏳ *Deadline:* ${notice.registrationDeadline}`);
  }

  if (notice.registrationLink) {
    lines.push(`🔗 *Register:* ${notice.registrationLink}`);
  }

  if (notice.organizer) {
    lines.push(`👤 *Organized By:* ${notice.organizer}`);
  }

  lines.push('');
  lines.push(`📝 *Details:*`);
  lines.push(notice.description);
  lines.push('');
  lines.push(`_Shared via Campus Pulse — Never Miss What Matters on Campus_`);

  return lines.join('\n');
}

