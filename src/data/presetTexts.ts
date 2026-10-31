export interface PresetNotice {
  label: string;
  sourceType: 'WhatsApp' | 'Email' | 'Notice Board' | 'Poster';
  text: string;
  description: string;
}

export const PRESET_NOTICES: PresetNotice[] = [
  {
    label: 'WhatsApp Forward (Messy & Abbreviated)',
    sourceType: 'WhatsApp',
    description: 'Casual forward with emojis, abbreviations ("tmrw", "audi 3", "shrp 10am")',
    text: `🚨🚨 ATTN ALL CS & IT STUDENTS!! 🚨🚨
Fwd as received from HOD office:
CyberSecurity Club is hosting an Ethical Hacking & CTF Flag Hunt contest!! 🚩💻
Date: 5th Nov 2026 (Wednesday)
Timings: sharp 10:00 AM onwards
Venue: Seminar Hall 2, Tech Block
Cash prize 15k INR for top 3 teams!! 🔥
Registration fee: FREE!
Last date to register is tomorrow 2nd Nov 11:59 PM.
Register fast on portal: https://cybersec.campus.edu/ctf-2026
Bring your own laptops with Kali Linux installed!
Dont miss this guys!!`,
  },
  {
    label: 'Official Dean Email',
    sourceType: 'Email',
    description: 'Formal academic announcement with structured guidelines',
    text: `Subject: Mandatory Orientation on Major Project Submission & Plagiarism Verification (Batch 2027)

Dear Final Year Students,

All students must attend the mandatory briefing regarding the Phase-1 Project synopsis and IEEE template guidelines.

Date of Briefing: November 7, 2026
Time: 11:30 AM
Venue: Dr. APJ Abdul Kalam Auditorium (Main Campus)
Speaker: Dean of Academic Research & Department Coordinators

Important Deadlines:
- Synopsis upload on Turnitin: November 10, 2026 by 5:00 PM
- Similarity index must strictly remain below 12%.

Attendance will be marked via biometric sensors at the auditorium entrance.

Regards,
Office of the Dean (Academics)`,
  },
  {
    label: 'Multi-Event Combined Notice (Splits into 2)',
    sourceType: 'WhatsApp',
    description: 'Two different campus events combined into one message',
    text: `📢 CAMPUS WEEKEND UPDATES - 2 BIG EVENTS! 📢

Event 1:
AI Prompt Engineering & LLM Hackathon
Date: Nov 6, 2026 at 2:00 PM
Venue: Cloud Computing Lab 3
Registration deadline: Nov 4, 2026 at 6:00 PM
Organized by: AI Research Society
Prizes worth $2,000 for the best autonomous agents!

-------------------------------------------

Event 2:
Inter-College Drama & Theater Club Auditions
Date: Nov 9, 2026 at 4:30 PM
Venue: Student Amphitheatre
Registration deadline: Nov 8, 2026
Come prepared with a 2-minute monologue in Hindi or English!`,
  },
  {
    label: 'Placement & Internship Drive Alert',
    sourceType: 'Email',
    description: 'High-priority corporate hiring announcement',
    text: `CAMPUS PLACEMENT BULLETIN - URGENT

Company: Goldman Sachs
Role: Summer Analyst - Quantitative Engineering 2027
Eligibility: B.Tech All Branches, CGPA >= 8.00, No Active Backlogs
Stipend: $2,500/month

Pre-Placement Talk (PPT):
Date: November 8, 2026
Time: 4:00 PM
Venue: Virtual via Zoom (Link will be sent to registered candidates)

Application Deadline: November 3, 2026 at 11:59 PM SHARP
Link to apply: https://campus-placements.edu/goldman-sachs-2027
Incomplete forms or missing resumes will lead to immediate disqualification.`,
  },
];

