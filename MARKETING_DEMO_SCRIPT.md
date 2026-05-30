# StudiQ — Marketing Demo Script
### For the Promo Video & Marketing Team Meeting

---

## OVERVIEW FOR THE TEAM

**What is StudiQ?**
StudiQ is an AI-powered A-Level (and GCSE) Maths tutoring platform built for UK students. It combines a personalised AI tutor called **SPOK**, Bayesian knowledge tracking, spaced repetition, and voice interaction — all in one place. The tagline is:

> _"SPOK knows exactly what you don't know — and fixes it."_

**Target audience:** UK secondary school students (Year 10–13), parents, and teachers.

**Pricing:** Free tier, Pro at £40/month or £400/year, Schools (custom).

**Tone for videos:** Smart, energetic, aspirational. Students achieving their target grades. Not boring, not corporate.

---

## PART 1 — THE HOOK (Opening Scene, ~15 seconds)

**Voiceover / On-screen text:**
> "You've been revising for hours. But are you revising the RIGHT things?"

Show: A student staring at a textbook late at night, looking lost.

**Cut to:** StudiQ dashboard loading. Clean, dark UI. Grade prediction jumps from a C to an A.

> "Meet StudiQ — the AI tutor that knows exactly where your gaps are, and closes them."

---

## PART 2 — THE LANDING PAGE & FIRST IMPRESSION

**URL:** `/` (Homepage)

**What to show:**
- The animated headline and hero section
- The exam countdown timer (e.g., "47 days until your A-Level")
- The feature highlights grid (Knowledge Tracing, Voice Tutor, Past Papers, Brain Map, etc.)
- The pricing comparison section (Free vs Pro vs Schools)
- Student testimonials

**Script:**
> "From the moment you land on StudiQ, it tells you how much time you have left — and what to do with it."

---

## PART 3 — SIGN UP & ONBOARDING (The Setup)

**URL:** `/sign-up` → `/onboarding`

**What to show:**
A 4-step onboarding flow that takes about 60 seconds:

1. **Language selection** — accessible from day one
2. **Name + SEND settings** — dyslexia-friendly font and ADHD mode can be turned on here
3. **Exam board, target grade, year group, exam date** — this is the engine of personalisation
4. **Confirmation + PWA install prompt** — add to home screen like a native app

**Script:**
> "Sign up takes under a minute. You tell StudiQ your exam board, your target grade, and when your exam is. That's it. The platform builds everything around YOU from that point."

**Key message:** No generic content. Everything is personalised from step one.

---

## PART 4 — THE DASHBOARD (The Control Centre)

**URL:** `/dashboard`

**What to show:**
- Personalised greeting (changes based on time of day)
- Key stats row: **Predicted Grade**, **Study Streak**, **XP Level**, **Topics Studied**
- Exam countdown card (big, visible countdown)
- Exam Readiness progress bar
- "Due for Review" section — topics the spaced repetition engine says you need to revisit today
- SPOK's recommendation — AI picks the single best topic to study next
- Morning Briefing — a personalised daily study brief
- Daily Challenge card
- Study plan for the week

**Script:**
> "Your dashboard is your mission control. Every morning it tells you your predicted grade, how many days until your exam, and exactly which topics to focus on today. SPOK has already done the thinking — you just have to show up."

**Highlight the Due for Review section:**
> "The spaced repetition engine tracks every topic you've studied. It tells you exactly when to come back to something — not too soon, not too late — so it sticks in your long-term memory."

---

## PART 5 — SPOK, THE AI TUTOR (The Hero Feature)

**URL:** `/jarvis`

**This is the most important section for the video.**

### Layout
Split screen: Chat on the left, a 3D animated avatar (SPOK) on the right.
SPOK animates — idle breathing, thinking, speaking, listening. It feels alive.

### Chat Modes (show each one)

| Mode | What it does |
|---|---|
| **Explain** | SPOK explains a concept from scratch with worked examples |
| **Quiz** | SPOK quizzes you on a topic, tracks right/wrong |
| **Check Working** | Upload a photo of your handwritten working — SPOK marks it step by step |
| **Find Gaps** | SPOK diagnoses what you don't know in a topic |
| **Past Paper** | SPOK works through real past paper questions with you |
| **Step-by-Step** | SPOK breaks down any problem into numbered steps |

### Voice Interaction
- Student speaks their question into the microphone
- Real-time waveform animation shows the audio being captured
- SPOK thinks (animated), then speaks the answer back
- Full two-way voice conversation

### Math Rendering
- All answers display with beautifully formatted equations (KaTeX)
- **Animated diagrams** draw themselves step-by-step as SPOK explains
- **Function graphs** plot in real time during explanations

### Image Marking
- Student takes a photo of their handwritten working
- SPOK reads it, identifies where the mistake was, and explains the correct method

### "Try It Yourself" Mode
- SPOK poses a problem
- Student attempts it
- SPOK marks it with detailed feedback

**Script:**
> "SPOK isn't just a chatbot. It explains, quizzes, marks your handwriting, draws diagrams, and speaks to you — all in real time. You can ask it anything, in your own words, and it meets you where you are."

**Show the 5 messages/day free tier and how upgrading unlocks unlimited access + voice:**
> "The free plan gives you a taste. Pro unlocks everything — unlimited questions, voice tutor, past paper AI, and extended thinking mode."

---

## PART 6 — TOPICS & LESSONS (The Curriculum)

**URL:** `/topics` → `/topics/[slug]/lesson/[id]`

### Topics Page
- Searchable grid of all A-Level and GCSE Maths topics
- Each topic has a colour-coded mastery level (Not Started / Beginner / Developing / Proficient / Mastered)
- Progress counter: "23 of 28 topics started"
- Categories: Pure Maths, Statistics, Mechanics (A-Level); Non-Calc, Calculator (GCSE)

**Script:**
> "Every topic on the curriculum is here. You can see at a glance what you've mastered and what still needs work."

### Lesson Player
Each lesson is a structured flow:

1. **Hook** — an engaging opening question to prime your brain
2. **Concept** — the theory, with KaTeX-rendered equations
3. **Worked Example** — step-by-step solution
4. **Checkpoint** — multiple choice question to test understanding mid-lesson
5. **Try It** — open-ended practice problem
6. **Summary** — recap of the key points
7. **Graph block** — interactive function visualisation if relevant

**Script:**
> "Lessons aren't just walls of text. They're interactive, step-by-step experiences with real maths rendering, worked examples, and checkpoints that keep you engaged throughout."

---

## PART 7 — PRACTICE (Questions on Demand)

**URL:** `/practice`

**What to show:**
- Select a topic
- Select difficulty
- Question appears with full KaTeX formatting
- Student answers
- Instant auto-marking with explanation
- Worked solution displayed

**Script:**
> "Need to drill a specific topic? Practice mode generates questions on demand, marks them instantly, and shows you exactly where you went wrong — every time."

---

## PART 8 — PAST PAPERS & MOCK EXAMS

**URL:** `/papers`

**What to show:**
- Paper type selector (Pure / Stats / Mechanics for A-Level; Non-Calc / Calc for GCSE)
- **Frequency heatmap** — visual grid showing which topics appear most in past papers
- **Generate Mock Exam** button — AI builds a paper targeted to your weak areas
- Saved Papers library — all previously generated mocks
- Paper viewer with Q&A interface and auto-marking

**Script:**
> "StudiQ knows which topics come up most in real exams. It uses that data to generate personalised mock papers weighted toward your weakest areas — so every mock you take is the most useful mock you could possibly do."

**Highlight the heatmap:**
> "This frequency map shows exactly where the exam boards focus their questions. No more guessing what to revise."

---

## PART 9 — PROGRESS & ANALYTICS

**URL:** `/progress`

**What to show:**
- Grade trend chart (last 90 days — a rising line)
- Accuracy metric (% of questions answered correctly)
- Active topics in the last 7 days
- Strengths breakdown (what you're good at)
- Focus areas (what needs work)
- XP level and streak badge

**Script:**
> "StudiQ tracks every answer you've ever given. Your grade trend shows how far you've come. Your strengths and focus areas update in real time based on what you've actually done — not what you think you know."

---

## PART 10 — THE BRAIN MAP (Most Visual Feature)

**URL:** `/brain`

**What to show:**
- 3D interactive network of all topics as nodes
- Nodes are colour-coded by mastery level (red = weak, green = mastered)
- Connections show topic relationships and dependencies
- Overall mastery percentage displayed
- Click a node to drill into that topic

**Script:**
> "This is your Brain Map. Every topic in the curriculum is a node. Green means you've mastered it. Red means it needs work. You can see your entire knowledge at a glance — and click any node to jump straight into that topic."

**This is a strong visual for the promo video — lean into it.**

---

## PART 11 — STUDY TIMETABLE

**URL:** `/timetable`

**What to show:**
- Calendar view with AI-generated study sessions
- Recommended topics per day leading up to the exam
- Adaptive adjustments as the student progresses
- Exam countdown integrated

**Script:**
> "Tell StudiQ your exam date and target grade. It builds you a complete study timetable — day by day, topic by topic — and adjusts it as you learn."

---

## PART 12 — LEADERBOARD (Gamification)

**URL:** `/leaderboard`

**What to show:**
- Global ranking table
- XP points per student
- Personal rank highlighted
- Filter by school / exam board / grade cohort

**Script:**
> "StudiQ turns revision into a competition. Earn XP for every question you answer, every lesson you complete, every day you show up. See where you rank against students across the country."

---

## PART 13 — ACCESSIBILITY & SEND

**URL:** `/accessibility`

**What to show:**
- Dyslexia-friendly font option (toggle in settings)
- ADHD mode: adaptive pacing, visual timers, positive reinforcement
- Encouragement mode in SPOK responses
- Simple, clean UI without clutter

**Script:**
> "StudiQ is built for every student. Dyslexia-friendly fonts, ADHD-aware pacing, and a visual timer mode — because great teaching should be accessible to everyone."

---

## PART 14 — FOR TEACHERS

**URL:** `/teacher` → `/teacher/students`

**What to show:**
- Teacher dashboard with class code
- List of linked students with their predicted grades, mastery levels, and streaks
- Click into any student to see their full dashboard
- Bulk management interface

**Script:**
> "Teachers can link their whole class to StudiQ with a single class code. From there, you can monitor every student's predicted grade, where they're struggling, and how consistently they're revising — all in one place."

---

## PART 15 — FOR SCHOOLS

**URL:** `/for-schools`

**What to show:**
- Bulk school licensing pitch
- Custom exam board configuration
- Account manager support
- Teacher dashboards for entire departments

**Script:**
> "For schools, StudiQ scales across entire year groups. Custom exam board settings, department-level analytics, and dedicated support — making it a tool for the whole school, not just individual students."

---

## PART 16 — HOW IT WORKS (The Science Behind It)

**URL:** `/how-it-works`

Use this page as a reference for the explainer section of your video. The six core mechanisms:

### 1. Bayesian Knowledge Tracing (BKT)
Every answer you give updates a probability model of whether you truly know a topic. It tracks four things:
- Probability you already knew it
- Probability you've now learned it
- Probability you slipped up despite knowing (slip)
- Probability you guessed correctly despite not knowing (guess)

This gives a real mastery score — not just "you got it right once."

**For video:** Show a dial or progress bar updating after each question.

### 2. Spaced Repetition (SM-2 Algorithm)
After you learn something, the system schedules the optimal moment to review it — before you forget. Each correct review pushes the next review further out. Wrong answers pull it closer.

**For video:** Show the "Due for Review" section on the dashboard — topics lighting up when it's time to revisit them.

### 3. Grade Prediction
Based on BKT mastery scores across all topics, the platform predicts your likely exam grade:
- A* (≥88% overall mastery), A (≥75%), B (≥62%), C (≥50%), D (≥38%), E (<38%)

**For video:** Show the grade prediction updating over several weeks of use — C → B → A.

### 4. AI Tutor (SPOK / Claude API)
Powered by Anthropic's Claude with a custom student profile injected into every conversation. SPOK knows your exam board, target grade, and weak topics before you even ask your first question.

**For video:** Show the chat — student asks "explain integration by parts," SPOK responds with a perfectly formatted worked example and offers to quiz the student.

### 5. Mock Paper Generation
StudiQ analyses historical past papers to build a frequency heatmap — which topics appear most often per exam board. When generating a mock, it weights questions toward your weakest, highest-frequency topics.

**For video:** Show the heatmap, then the "Generate Mock" button, then a custom paper appearing.

### 6. Brain Map Visualisation
Using Three.js, topic nodes are rendered as a 3D network. Connections represent curriculum dependencies. Mastery colours update in real time as the student learns.

**For video:** Dramatic zoom-out from one topic node to the full network — all red, then slowly turning green over the course of the video.

---

## PART 17 — CLOSING SHOT & CTA

**Show:** A student at their desk, confident. Dashboard open. Grade prediction showing A*.

**Voiceover:**
> "StudiQ doesn't just help you revise. It learns how you think, fills in your gaps, and gets you exam-ready — faster than you thought possible."

**On screen:**
> "Free to start. studiq.app"

**Optional social proof line:**
> "Join thousands of students already hitting their target grades."

---

## VIDEO STRUCTURE RECOMMENDATIONS

### Short-form (30–60 seconds) — for Instagram / TikTok / YouTube Shorts
1. Hook (5s): "Are you revising the right things?"
2. Dashboard flash (5s): Grade, streak, countdown
3. SPOK in action (15s): Voice question → animated answer
4. Brain Map visual (5s): Nodes going green
5. Grade going up (5s): C → A
6. CTA (5s): studiq.app

### Long-form (2–3 minutes) — for YouTube / website hero
Full walkthrough following the structure above: onboarding → dashboard → SPOK → topics → papers → brain map → teacher → CTA.

### Teacher/School-focused cut (60 seconds)
1. Teacher pain point: "How do you know who's actually revising?"
2. Teacher dashboard walkthrough
3. Student progress monitoring
4. CTA: "studiq.app/for-schools"

---

## KEY MESSAGES TO REPEAT THROUGHOUT

1. **Personalised, not generic** — everything adapts to your exam board, grade target, and actual performance.
2. **SPOK knows what you don't know** — the AI isn't just a chatbot; it's diagnostic.
3. **Science-backed** — Bayesian knowledge tracing and spaced repetition are proven methods.
4. **Exam-focused** — every feature is designed around getting you ready for the real exam.
5. **Accessible** — built for all students, including those with dyslexia or ADHD.
6. **Free to start** — no barrier to entry.

---

## ASSETS YOU'LL NEED FROM THE PRODUCT

- [ ] Screen recordings of: dashboard, SPOK chat (with voice), brain map, past paper generator
- [ ] Animated walkthrough of onboarding flow
- [ ] Screen recording of grade prediction changing over time (use test account)
- [ ] Brain Map 3D rotation clip
- [ ] Diagram animation example (e.g., circle theorems, integration)
- [ ] Teacher dashboard walkthrough
- [ ] B-roll: student at desk, phone showing PWA, handwriting being marked by SPOK

---

*Script prepared for the StudiQ marketing team — May 2026*
