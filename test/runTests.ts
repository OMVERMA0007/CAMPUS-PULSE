import { extractNoticesLocally } from '../src/services/nlpParser.js';
import { PRESET_NOTICES } from '../src/data/presetTexts.js';
import { SAMPLE_NOTICES } from '../src/data/sampleNotices.js';
import { computeDynamicPriority } from '../src/utils/dateUtils.js';
import { generateWeeklySummary } from '../src/services/weeklySummaryService.js';
import { storageService } from '../src/services/storageService.js';

console.log('=== CAMPUS PULSE TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Test WhatsApp Forward Extraction
console.log('1. Testing WhatsApp Forward Extraction...');
const waPreset = PRESET_NOTICES[0];
const waExtracted = extractNoticesLocally(waPreset.text);
assert(waExtracted.length === 1, 'Extracted exactly 1 event from WhatsApp forward');
assert(waExtracted[0].category === 'Hackathons' || waExtracted[0].category === 'Competitions', `Category detected properly: ${waExtracted[0].category}`);
assert(waExtracted[0].venue.toLowerCase().includes('seminar hall'), `Venue extracted: ${waExtracted[0].venue}`);
assert(waExtracted[0].time.includes('10:00 AM'), `Time extracted: ${waExtracted[0].time}`);
assert(waExtracted[0].registrationLink && waExtracted[0].registrationLink.includes('cybersec.campus.edu'), 'Extracted registration link correctly');

// 2. Test Multi-Event Detection & Separation
console.log('\n2. Testing Multi-Event Separation...');
const multiPreset = PRESET_NOTICES[2];
const multiExtracted = extractNoticesLocally(multiPreset.text);
assert(multiExtracted.length >= 2, `Separated combined message into ${multiExtracted.length} events (expected >= 2)`);
assert(multiExtracted[0].category === 'Hackathons', `Event 1 categorized as Hackathons (got ${multiExtracted[0].category})`);
assert(multiExtracted[1].category === 'Cultural Events', `Event 2 categorized as Cultural Events (got ${multiExtracted[1].category})`);

// 3. Test Missing Information: Zero Hallucination
console.log('\n3. Testing Zero Hallucination on Sparse Text...');
const sparseText = "Meeting tomorrow for the Chess club in Room 204 to discuss tournament rules.";
const sparseExtracted = extractNoticesLocally(sparseText);
assert(sparseExtracted[0].time === 'Not specified', `Unspecified time correctly marked as 'Not specified' (got ${sparseExtracted[0].time})`);
assert(sparseExtracted[0].registrationDeadline === 'Not specified', `Unspecified deadline correctly marked as 'Not specified' (got ${sparseExtracted[0].registrationDeadline})`);
assert(sparseExtracted[0].venue.includes('Room 204'), `Venue extracted accurately from sparse text: ${sparseExtracted[0].venue}`);

// 4. Test Dynamic Priority Classification
console.log('\n4. Testing Priority Classification...');
const urgentPriority = computeDynamicPriority({
  date: '2026-11-15',
  registrationDeadline: '2026-10-31T20:00:00', // within a few hours of current simulated time
});
assert(urgentPriority === 'URGENT', `Deadline in < 24h triggers URGENT (got ${urgentPriority})`);

const todayPriority = computeDynamicPriority({
  date: '2026-10-31', // Today
  registrationDeadline: 'Not specified',
});
assert(todayPriority === 'TODAY', `Event date of today triggers TODAY (got ${todayPriority})`);

// 5. Test Duplicate Detection
console.log('\n5. Testing Duplicate Detection...');
const dupes = storageService.findPossibleDuplicates(
  'Smart India Hackathon 2026 Campus Round',
  SAMPLE_NOTICES,
  '2026-11-04'
);
assert(dupes.length > 0, `Detected duplicate notice: found ${dupes.length} matches`);

// 6. Test Weekly Executive Briefing Generation
console.log('\n6. Testing Weekly Summary Generation...');
const summary = generateWeeklySummary(SAMPLE_NOTICES, 'Alex Rivera');
assert(summary.headline.length > 0, 'Generated headline briefing');
assert(summary.urgentDeadlines.length > 0, `Identified ${summary.urgentDeadlines.length} urgent deadlines`);
assert(summary.todayEvents.length > 0, `Identified ${summary.todayEvents.length} events happening today`);
assert(summary.opportunities.length > 0, `Identified ${summary.opportunities.length} active opportunities`);

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
