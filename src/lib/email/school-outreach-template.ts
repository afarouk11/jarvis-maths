interface OutreachEmailOptions {
  schoolName: string
  offersAlevel: boolean
  offersGCSE: boolean
}

export function schoolOutreachEmail(opts: OutreachEmailOptions): { subject: string; html: string; text: string } {
  const { schoolName, offersAlevel, offersGCSE } = opts

  const courses = offersAlevel && offersGCSE
    ? 'GCSE and A-level Maths'
    : offersAlevel
      ? 'A-level Maths'
      : 'GCSE Maths'

  const yearGroups = offersAlevel && offersGCSE
    ? 'Years 10–13'
    : offersAlevel
      ? 'Years 12–13'
      : 'Years 10–11'

  const subject = `Free AI Maths Tutor for ${schoolName} — Summer + Autumn Term`

  const text = `Dear Head of Maths at ${schoolName},

Most of your students who underperform in maths aren't lazy. They just don't know what to revise — so they revise everything, retain little, and walk into exams repeating the same mistakes.

Private tutors fix this. They diagnose the exact gaps, focus every session on what actually costs marks, and adjust in real time. But at £50–80 an hour, most students never get access to one.

That's the gap StudiQ was built to close.

I'm Muhammad, co-founder of StudiQ — an AI maths tutoring platform that does what a great private tutor does: builds a precise map of each student's knowledge, identifies the exact subtopics costing them marks, and closes those gaps before the exam. It works for ${courses} students and covers AQA, Edexcel and OCR.

WHY BOTHER?
Because it costs you nothing to find out. We're offering ${schoolName} two things completely free — no budget, no contract, no commitment beyond the term:

1. A SUMMER MATHS PROGRAMME (July–August)
Students work through StudiQ independently at their own pace. Perfect for incoming Year 12s building on their GCSE, Year 13 resitters, or any student who wants to arrive in September ahead of the curve.

2. FULL CLASS ACCESS FROM SEPTEMBER (Autumn Term)
Free for all your ${yearGroups} students for the entire autumn term, including the teacher dashboard so you can track every student's predicted grade and progress from day one.

WHAT STUDENTS GET
• SPOK — a voice and text AI tutor that explains maths step by step, marks their answers, and adapts to their exact gaps
• Knowledge Tracing — pinpoints precisely which subtopics are costing marks
• Past paper AI — 5-year question analysis for AQA, Edexcel and OCR
• Spaced repetition — proven to double long-term retention
• Teacher dashboard — predicted grades, mastery by topic, daily activity${offersAlevel ? `
• Full GCSE and A-level coverage in one place` : ''}

WHAT WE ASK IN RETURN
Only two things:
1. Students complete a baseline assessment before they start (50 minutes — we provide the paper)
2. Students complete the same assessment at the end of term

That's it. We want to prove this works with real data, not testimonials. If it doesn't move the needle, we'd rather know.

IN PRACTICE
• Under 10 minutes to set up — students join with a class code
• No IT changes — runs in any browser on any device
• You receive a full progress report at the end of term

Watch the 2-minute demo: https://youtu.be/5lNYCryUae0
Full details and try it yourself: https://studiq.org/schools

If this sounds worth exploring, just reply to this email. I'll personally handle setup and be your point of contact throughout.

Thank you for your time.

Warm regards,
Muhammad Nakmouche
Co-founder, StudiQ
admin@studiq.org
studiq.org

P.S. No cost. No upsell. No obligation beyond the term. If the data doesn't show results worth continuing, we'd rather know than not.

---
You're receiving this because ${schoolName} is a London secondary school that teaches ${courses}.
To opt out permanently, reply with "unsubscribe" and we will remove you immediately.`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f1724 0%,#1a2540 100%);padding:32px 40px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="width:36px;height:36px;background:#1d3a7a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#3b82f6;font-weight:800;font-size:18px;">S</span>
        </div>
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">StudiQ</span>
      </div>
      <h1 style="color:#ffffff;font-size:21px;font-weight:700;margin:0;line-height:1.35;letter-spacing:-0.01em;">
        Free AI Maths Tutor for Your ${courses} Students<br/>
        <span style="color:#60a5fa;">Summer Programme + Autumn Term</span>
      </h1>
      <p style="color:#5a7aaa;font-size:13px;margin:10px 0 0;">${yearGroups} · AQA · Edexcel · OCR · No cost required</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;color:#374151;line-height:1.7;font-size:15px;">

      <p style="margin-top:0;">Dear Head of Maths at <strong>${schoolName}</strong>,</p>

      <p>Most of your students who underperform in maths aren't lazy. They just don't know what to revise — so they revise everything, retain little, and walk into exams repeating the same mistakes.</p>

      <p>Private tutors fix this. They diagnose the exact gaps, focus every session on what actually costs marks, and adjust in real time. But at <strong>£50–80 an hour</strong>, most students never get access to one.</p>

      <p style="font-weight:600;color:#111827;">That's the gap StudiQ was built to close.</p>

      <p>I'm Muhammad, co-founder of <strong>StudiQ</strong> — an AI maths tutoring platform that does what a great private tutor does: builds a precise map of each student's knowledge, identifies the subtopics costing them marks, and closes those gaps before the exam. Built for <strong>${courses}</strong> students across AQA, Edexcel and OCR.</p>

      <!-- Why bother -->
      <div style="background:#f8faff;border:1px solid #e0eaff;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 10px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">Why bother?</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
          Because it costs you nothing to find out. We're not asking for budget, a long-term commitment, or even much of your time.
          We're offering <strong>${schoolName}</strong> free access for the summer and the entire autumn term.
          If it moves the needle for your students, we'll have the data to prove it. If it doesn't, we'd genuinely rather know.
        </p>
      </div>

      <!-- Two offers -->
      <div style="display:grid;gap:12px;margin:24px 0;">

        <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="margin:0 0 6px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">☀️ Summer Maths Programme — July &amp; August</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">For incoming Year 12s building on their GCSE, Year 13 resitters, or any student who wants to arrive in September ahead of the curve. Students work independently at their own pace — no timetable required.</p>
        </div>

        <div style="background:#f0f6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="margin:0 0 6px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">📚 Full Class Access — Autumn Term from September</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">Free for all your ${yearGroups} students for the entire autumn term. Includes the teacher dashboard so you can see every student's predicted grade, mastery by topic, and daily activity — from day one.</p>
        </div>

      </div>

      <!-- What students get -->
      <div style="background:#fffdf0;border:1px solid #fde68a;border-radius:8px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">What every student gets</p>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2.1;">
          <li><strong>SPOK</strong> — voice &amp; text AI tutor that explains step-by-step, marks answers, and adapts to each student's exact gaps</li>
          <li><strong>Knowledge Tracing</strong> — pinpoints the precise subtopics costing marks in ${courses}</li>
          <li><strong>Past paper AI</strong> — 5-year question analysis for AQA, Edexcel &amp; OCR</li>
          <li><strong>Spaced repetition</strong> — questions timed to hit before a student forgets, proven to double retention</li>
          <li><strong>Teacher dashboard</strong> — predicted grades, mastery by topic, and daily activity per student</li>
          ${offersAlevel ? '<li><strong>GCSE &amp; A-level in one place</strong> — full specification coverage for both courses</li>' : ''}
        </ul>
      </div>

      <!-- What we ask -->
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:18px 22px;margin:24px 0;">
        <p style="margin:0 0 10px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">What we ask in return</p>
        <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2.1;">
          <li>Students complete a <strong>baseline assessment before they start</strong> (50 minutes — we provide the paper)</li>
          <li>Students complete the <strong>same assessment at the end of term</strong> to measure real progress</li>
        </ol>
        <p style="margin:12px 0 0;font-size:13px;color:#92400e;">We want rigorous evidence, not anecdotes. If the data doesn't show results, we'd rather know.</p>
      </div>

      <!-- Video thumbnail -->
      <div style="margin:28px 0;text-align:center;">
        <a href="https://youtu.be/5lNYCryUae0" target="_blank" style="display:block;text-decoration:none;position:relative;">
          <img src="https://img.youtube.com/vi/5lNYCryUae0/maxresdefault.jpg"
            alt="Watch the StudiQ demo"
            width="100%"
            style="border-radius:10px;display:block;border:2px solid #dbeafe;" />
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;background:rgba(220,38,38,0.92);border-radius:50%;">
            <div style="width:0;height:0;border-style:solid;border-width:10px 0 10px 20px;border-color:transparent transparent transparent #ffffff;position:absolute;top:50%;left:55%;transform:translate(-50%,-50%);"></div>
          </div>
        </a>
        <p style="margin:10px 0 0;font-size:13px;color:#6b7280;">▶ Watch the 2-minute demo</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="https://studiq.org/schools" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.01em;">
          See the full offer →
        </a>
        <p style="margin:14px 0 0;font-size:14px;color:#374151;">Or just <strong>reply to this email</strong> — I'll personally handle everything.</p>
      </div>

      <p style="font-size:14px;color:#374151;margin-bottom:4px;">Thank you for your time.</p>
      <p style="font-size:14px;margin:0;color:#374151;">
        Warm regards,<br/>
        <strong>Muhammad Nakmouche</strong><br/>
        Co-founder, StudiQ<br/>
        <a href="mailto:admin@studiq.org" style="color:#3b82f6;text-decoration:none;">admin@studiq.org</a>
        &nbsp;·&nbsp;
        <a href="https://studiq.org" style="color:#3b82f6;text-decoration:none;">studiq.org</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;font-size:12px;color:#9ca3af;line-height:1.6;">
      <p style="margin:0;">You're receiving this because ${schoolName} is a London secondary school that teaches ${courses}.</p>
      <p style="margin:4px 0 0;">To opt out permanently, reply with "unsubscribe" and we will remove you immediately.</p>
    </div>
  </div>
</body>
</html>`

  return { subject, html, text }
}
