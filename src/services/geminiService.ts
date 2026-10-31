import { ExtractedNoticeDraft, Category, PriorityLevel } from '../types';
import { extractNoticesLocally } from './nlpParser';

const SYSTEM_PROMPT = `You are the AI extraction engine for Campus Pulse, a smart campus assistant.
Your job is to analyze unstructured campus announcements (WhatsApp forwards, emails, posters) and extract structured event cards.

STRICT ACCURACY RULES:
1. NEVER hallucinate or invent missing details.
2. If Date is not mentioned in the text, you MUST return "Not specified".
3. If Time is not mentioned, you MUST return "Not specified".
4. If Venue is not mentioned, you MUST return "Not specified".
5. If Registration Deadline is not mentioned, you MUST return "Not specified".
6. If the text contains MULTIPLE distinct events/notices, you MUST return an array of all detected events.
7. Category MUST be one of:
   - "Academic"
   - "Exams"
   - "Workshops"
   - "Hackathons"
   - "Competitions"
   - "Cultural Events"
   - "Sports"
   - "Placement & Internships"
   - "Important Notices"
   - "Other"
8. Priority MUST be one of: "URGENT", "TODAY", "UPCOMING", "NORMAL", "EXPIRED".

Respond ONLY with valid JSON in this exact structure:
{
  "events": [
    {
      "title": "Clean, descriptive event title",
      "category": "One of the allowed categories",
      "date": "YYYY-MM-DD or 'Not specified'",
      "time": "e.g. '10:00 AM' or 'Not specified'",
      "venue": "Specific hall/room or 'Not specified'",
      "registrationDeadline": "YYYY-MM-DDTHH:mm or YYYY-MM-DD or 'Not specified'",
      "description": "2-3 concise sentences summarizing key details and requirements",
      "priority": "URGENT | TODAY | UPCOMING | NORMAL",
      "tags": ["tag1", "tag2"],
      "organizer": "Club / Department name or undefined",
      "registrationLink": "URL or undefined"
    }
  ]
}`;

export interface ExtractionResult {
  drafts: ExtractedNoticeDraft[];
  engine: 'Gemini AI' | 'Smart Local Parser';
  rawApiResponse?: string;
  errorMessage?: string;
}

/**
 * Extracts notice details using either Gemini AI API (if key is set)
 * or falls back to our robust Smart Local Heuristic Parser.
 */
export async function extractNoticeDetails(
  rawText: string,
  apiKey?: string
): Promise<ExtractionResult> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      drafts: [],
      engine: 'Smart Local Parser',
    };
  }

  // 1. Try Gemini AI if API key is provided
  const keyToUse = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);

  if (keyToUse && keyToUse.trim()) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\nUnstructured Campus Text to Analyze:\n"""\n${trimmed}\n"""`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn('Gemini API call failed, falling back to local parser:', errText);
        return {
          drafts: extractNoticesLocally(trimmed),
          engine: 'Smart Local Parser',
          errorMessage: `Gemini API returned status ${response.status}. Used local parser instead.`,
        };
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.events && Array.isArray(parsed.events) && parsed.events.length > 0) {
          const validatedEvents: ExtractedNoticeDraft[] = parsed.events.map((ev: Record<string, unknown>) => ({
            title: String(ev.title || 'Campus Notice'),
            category: (ev.category as Category) || 'Other',
            date: String(ev.date || 'Not specified'),
            time: String(ev.time || 'Not specified'),
            venue: String(ev.venue || 'Not specified'),
            registrationDeadline: String(ev.registrationDeadline || 'Not specified'),
            description: String(ev.description || ''),
            priority: (ev.priority as PriorityLevel) || 'NORMAL',
            tags: Array.isArray(ev.tags) ? ev.tags.map(String) : [],
            organizer: ev.organizer ? String(ev.organizer) : undefined,
            registrationLink: ev.registrationLink ? String(ev.registrationLink) : undefined,
            confidenceScore: 0.98,
          }));

          return {
            drafts: validatedEvents,
            engine: 'Gemini AI',
            rawApiResponse: content,
          };
        }
      }
    } catch (err) {
      console.warn('Error during Gemini API parsing, using local fallback:', err);
      return {
        drafts: extractNoticesLocally(trimmed),
        engine: 'Smart Local Parser',
        errorMessage: 'Network or parsing error. Smart Local Heuristic Parser used seamlessly.',
      };
    }
  }

  // 2. Local Fallback Engine
  const localDrafts = extractNoticesLocally(trimmed);
  return {
    drafts: localDrafts,
    engine: 'Smart Local Parser',
  };
}

/**
 * Validates a Gemini API Key with a quick ping
 */
export async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is empty.' };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test. Reply with "pong".' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      }
    );

    if (res.ok) {
      return { valid: true };
    }
    const err = await res.json().catch(() => ({}));
    return { valid: false, error: err?.error?.message || `HTTP ${res.status}` };
  } catch (e) {
    return { valid: false, error: (e as Error).message || 'Network error' };
  }
}

