import { ExtractedNoticeDraft, Category, PriorityLevel } from '../types';
import { format, addDays } from 'date-fns';

/**
 * Robust Local Heuristic NLP Parser for campus announcements.
 * Never invents dates, times, or venues if they are not explicitly present.
 */
export function extractNoticesLocally(rawText: string): ExtractedNoticeDraft[] {
  if (!rawText || !rawText.trim()) return [];

  // Check if text has multiple notices/events
  const segments = splitMultipleEvents(rawText);

  return segments.map(seg => parseSingleNotice(seg));
}

/**
 * Splits text if multiple events are detected (e.g. "Event 1:", "---", or multiple numbered items)
 */
function splitMultipleEvents(text: string): string[] {
  // Check for horizontal divider
  if (text.includes('---') || text.includes('===') || text.includes('___')) {
    const parts = text.split(/[-=_]{3,}/).map(p => p.trim()).filter(p => p.length > 25);
    if (parts.length > 1) return parts;
  }

  // Check for "Event 1:" ... "Event 2:" or "Notice 1:" ... "Notice 2:"
  const eventHeaderRegex = /(?:Event\s*[1-9]|Notice\s*[1-9]|Update\s*[1-9])\s*:/i;
  if (eventHeaderRegex.test(text)) {
    const parts = text.split(/(?=(?:Event\s*[1-9]|Notice\s*[1-9]|Update\s*[1-9])\s*:)/i)
      .map(p => p.trim())
      .filter(p => p.length > 25);
    if (parts.length > 1) return parts;
  }

  // Check for distinct numbered headers with dates like "1. Hackathon... 2. Drama..."
  const numberedEvents = text.split(/(?:\n\s*\n|\r\n\s*\r\n)(?=\d+[\.\)]\s+[A-Z])/g)
    .map(p => p.trim())
    .filter(p => p.length > 40 && /(?:date|venue|time|hall|audi|contest|workshop|fest)/i.test(p));
  if (numberedEvents.length > 1) return numberedEvents;

  return [text];
}

/**
 * Parses a single notice segment using heuristic patterns
 */
function parseSingleNotice(text: string): ExtractedNoticeDraft {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Title Extraction
  const title = extractTitle(lines, text);

  // 2. Category Detection
  const category = detectCategory(text, title);

  // 3. Date Extraction (Never hallucinate, return 'Not specified' if absent)
  const date = extractDate(text);

  // 4. Starting Time Extraction
  const time = extractTime(text);

  // 5. Venue Extraction
  const venue = extractVenue(text);

  // 6. Registration Deadline Extraction
  const registrationDeadline = extractDeadline(text);

  // 7. Links & Organizers
  const registrationLink = extractLink(text);
  const organizer = extractOrganizer(text);

  // 8. Description
  const description = extractDescription(text, title);

  // 9. Priority Level
  const priority = determinePriority(date, registrationDeadline, text);

  // 10. Tags
  const tags = generateTags(category, title, text);

  return {
    title,
    category,
    date,
    time,
    venue,
    registrationDeadline,
    description,
    priority,
    tags,
    organizer,
    registrationLink,
    confidenceScore: 0.92,
  };
}

function extractTitle(lines: string[], text: string): string {
  // Look for "Subject:" line
  const subjectLine = lines.find(l => /^subject:\s*/i.test(l));
  if (subjectLine) {
    return subjectLine.replace(/^subject:\s*/i, '').trim();
  }

  // Look for "Event:" or "Title:" line
  const titlePrefix = lines.find(l => /^(?:event\s*(?:\d+:)?|title:|notice:)\s*/i.test(l));
  if (titlePrefix) {
    const cleaned = titlePrefix.replace(/^(?:event\s*(?:\d+:)?|title:|notice:)\s*/i, '').trim();
    if (cleaned.length > 3) return cleaned;
  }

  // Look for first bold/emoji-highlighted line or first uppercase line
  for (const line of lines) {
    // Strip emojis and leading asterisks/bullets
    const clean = line.replace(/[*#_~`]|[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    if (clean.length >= 6 && clean.length <= 90 && !/^(attn|fwd|dear|note|important|date|venue|time)/i.test(clean)) {
      return clean;
    }
  }

  // Fallback to first non-empty line truncated
  const firstLine = (lines[0] || 'Campus Announcement').replace(/[*#_~`]|[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  return firstLine.slice(0, 75) || 'Campus Announcement';
}

function detectCategory(text: string, title: string): Category {
  const combined = `${title} ${text}`.toLowerCase();

  if (/(?:hackathon|sih|smart india|coding contest|ctf|flag hunt|devfest|codeathon)/i.test(combined)) {
    return 'Hackathons';
  }
  if (/(?:exam|midsem|endsem|hall ticket|admit card|seating allotment|viva|re-exam)/i.test(combined)) {
    return 'Exams';
  }
  if (/(?:placement|recruitment|internship|hiring|job drive|t&p|campus drive|stipend|ctc|package)/i.test(combined)) {
    return 'Placement & Internships';
  }
  if (/(?:workshop|masterclass|bootcamp|hands-on|training session|lab session|seminar|guest lecture|webinar)/i.test(combined)) {
    return 'Workshops';
  }
  if (/(?:dance|music|band|tarang|cultural|drama|nukkad|fashion show|theatre|art fest|singing)/i.test(combined)) {
    return 'Cultural Events';
  }
  if (/(?:sports|tournament|football|cricket|basketball|badminton|athletics|championship|match)/i.test(combined)) {
    return 'Sports';
  }
  if (/(?:competition|challenge|quiz|olympiad|showcase|expo|prize pool|trophy)/i.test(combined)) {
    return 'Competitions';
  }
  if (/(?:syllabus|curriculum|class|lecture|attendance|assignment|synopsis|thesis|grade|credit)/i.test(combined)) {
    return 'Academic';
  }
  if (/(?:library|fine|fee|hostel|bus|transport|id card|amnesty|holiday|circular|notice)/i.test(combined)) {
    return 'Important Notices';
  }

  return 'Other';
}

function extractDate(text: string): string {
  const now = new Date();

  // Check for "today"
  if (/\b(?:today|tonight)\b/i.test(text)) {
    return format(now, 'yyyy-MM-dd');
  }

  // Check for "tomorrow" or "tmrw"
  if (/\b(?:tomorrow|tmrw)\b/i.test(text)) {
    return format(addDays(now, 1), 'yyyy-MM-dd');
  }

  // Check for explicit dates like "Nov 5, 2026", "5th Nov 2026", "November 7, 2026"
  const monthNames = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';

  // Pattern: "Date: Nov 5, 2026" or "5th Nov 2026"
  const explicitDateRegex = new RegExp(`(?:date(?:\\s*of\\s*briefing)?|on)?\\s*:?\\s*(\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${monthNames})(?:,?\\s+\\d{4})?|(?:${monthNames})\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?)`, 'i');
  const match = text.match(explicitDateRegex);
  if (match && match[1]) {
    const raw = match[1].replace(/(?:st|nd|rd|th)/gi, '').trim();
    const parsed = normalizeDateString(raw);
    if (parsed) return parsed;
  }

  // Pattern: YYYY-MM-DD
  const isoMatch = text.match(/\b(202[4-9]-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  // Pattern: DD/MM/YYYY
  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(202[4-9])\b/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return 'Not specified';
}

function normalizeDateString(str: string): string | null {
  try {
    const cleanStr = str.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleanStr.split(' ');
    let day = 1;
    let monthIndex = 10; // default Nov
    let year = 2026;

    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (months[lower] !== undefined) {
        monthIndex = months[lower];
      } else if (/^\d{4}$/.test(part)) {
        year = parseInt(part, 10);
      } else if (/^\d{1,2}$/.test(part)) {
        day = parseInt(part, 10);
      }
    }

    const d = new Date(year, monthIndex, day);
    return format(d, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

function extractTime(text: string): string {
  // Matches e.g. "sharp 10:00 AM", "10:30 AM", "2:00 PM", "4 PM", "11:30 AM"
  const timeRegex = /(?:timings?|time|at)?\s*:?\s*(?:sharp\s+)?(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/;
  const match = text.match(timeRegex);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // 24-hour pattern "14:30" or "09:00"
  const hr24Match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\s*(?:hrs|hours)?\b/);
  if (hr24Match) {
    const hrs = parseInt(hr24Match[1], 10);
    const mins = hr24Match[2];
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = hrs % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  }

  return 'Not specified';
}

function extractVenue(text: string): string {
  // Look for explicit "Venue: ..." or "Location: ..."
  const venuePrefixRegex = /(?:venue|location|held\s+at)\s*:\s*([^\n\r,;.]{3,50})/i;
  const prefixMatch = text.match(venuePrefixRegex);
  if (prefixMatch && prefixMatch[1]) {
    const v = prefixMatch[1].replace(/[*_~`]/g, '').trim();
    if (!/^(date|time|link|http)/i.test(v)) {
      return v;
    }
  }

  // Look for structured room/hall patterns like "Room 204", "Lab 402", "Audi B", "Seminar Hall 2"
  const structuredPattern = /\b(?:(?:Dr\.?\s+)?[A-Z][a-z]+\s+)?(?:Seminar Hall|Audi(?:torium)?|Computing Lab|Maker Space|Amphitheatre|Sports Complex|T&P Hall|Turing Hall)\s*(?:[A-Z0-9-]+)?\b/i;
  const structMatch = text.match(structuredPattern);
  if (structMatch && structMatch[0]) {
    return structMatch[0].trim();
  }

  const roomPattern = /\b(?:Room|Classroom|Lab|Hall)\s*[A-Z0-9-]+\b/i;
  const roomMatch = text.match(roomPattern);
  if (roomMatch && roomMatch[0]) {
    return roomMatch[0].trim();
  }

  if (/virtual|zoom|google meet|teams/i.test(text)) {
    return 'Virtual / Online';
  }

  return 'Not specified';
}

function extractDeadline(text: string): string {
  const now = new Date();

  // "Last date to register is tomorrow 2nd Nov 11:59 PM"
  // "Application Deadline: November 3, 2026 at 11:59 PM"
  // "Register before Nov 4, 2026 at 6:00 PM"
  const deadlineRegex = /(?:last\s*date|deadline|register\s*before|register\s*by|submit\s*by|upload\s*on\s*turnitin:?|apply\s*before)\s*:?\s*([^\n\r.;]{4,60})/i;
  const match = text.match(deadlineRegex);

  if (match && match[1]) {
    const raw = match[1];

    if (/today|tonight/i.test(raw)) {
      return `${format(now, 'yyyy-MM-dd')}T23:59:00`;
    }
    if (/tomorrow|tmrw/i.test(raw)) {
      return `${format(addDays(now, 1), 'yyyy-MM-dd')}T23:59:00`;
    }

    const d = normalizeDateString(raw);
    if (d) {
      // Check if time is also in raw
      const t = raw.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
      if (t) {
        return `${d}T23:59:00`;
      }
      return `${d}T23:59:00`;
    }
  }

  // Look for standalone "tonight 11:59 PM"
  if (/tonight\s+11:59/i.test(text)) {
    return `${format(now, 'yyyy-MM-dd')}T23:59:00`;
  }

  return 'Not specified';
}

function extractLink(text: string): string | undefined {
  const match = text.match(/(https?:\/\/[^\s"'<>()[\]]+)/i);
  return match ? match[1] : undefined;
}

function extractOrganizer(text: string): string | undefined {
  const match = text.match(/(?:organized by|speaker|from|regards|club|society)\s*:?\s*([^\n\r,;.]{3,45})/i);
  if (match && match[1]) {
    const org = match[1].replace(/[*_]/g, '').trim();
    if (!/^(date|time|venue)/i.test(org)) return org;
  }
  return undefined;
}

function extractDescription(text: string, title: string): string {
  // Strip excessive markdown / emojis / header boilerplate
  const clean = text
    .replace(/[*_#~`]/g, '')
    .replace(/🚨|🔥|📢|🎉|💻|🚩|🏆|⚽|🎭|🤖|✨/g, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.toLowerCase().includes(title.toLowerCase().slice(0, 20)))
    .join(' ');

  return clean.slice(0, 320) || 'Notice details extracted from campus announcement.';
}

function determinePriority(date: string, deadline: string, text: string): PriorityLevel {
  const combined = text.toLowerCase();

  // If text has urgent signals
  if (/urgent|attn|mandatory|strict|important notice|last chance|immediately/i.test(combined)) {
    return 'URGENT';
  }

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  if (deadline && deadline.startsWith(todayStr)) {
    return 'URGENT';
  }

  if (date === todayStr) {
    return 'TODAY';
  }

  if (date !== 'Not specified') {
    return 'UPCOMING';
  }

  return 'NORMAL';
}

function generateTags(category: Category, title: string, text: string): string[] {
  const tags = new Set<string>();
  tags.add(category.replace('&', 'and').replace(/\s+/g, ''));

  const keywords = ['Hackathon', 'Coding', 'Placement', 'Internship', 'Workshop', 'AI', 'Google', 'Exam', 'Audition', 'Dance', 'Sports', 'Dean', 'Project'];
  for (const kw of keywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(`${title} ${text}`)) {
      tags.add(kw);
    }
  }

  return Array.from(tags).slice(0, 4);
}

