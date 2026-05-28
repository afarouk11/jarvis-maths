interface OutreachEmailOptions {
  schoolName: string
  offersAlevel: boolean   // true → school teaches A-level maths
  offersGCSE: boolean     // true → school teaches GCSE maths (always true after seed filter)
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

  const subject = offersAlevel
    ? `Free AI Maths Tutor for Your ${courses} Students This Term — No Cost Required`
    : `Free AI Maths Tutor for Your GCSE Maths Students This Term — No Cost Required`

  const text = `Dear Head of Maths at ${schoolName},

I'm writing on behalf of StudiQ, an AI-powered maths tutoring platform built specifically for ${courses} students. We're reaching out to a small number of London schools this term with an offer to provide completely free access for all your ${yearGroups} students — no budget required, no commitment beyond this term.

WHAT WE'RE PROPOSING

We would give every ${courses} student full access to StudiQ's platform for one complete term, including:

• SPOK — a voice and text AI tutor that explains maths step-by-step, answers questions out loud, and adapts to each student's exact knowledge gaps
• Bayesian Knowledge Tracing — a diagnostic engine that pinpoints precisely which subtopics each student is weak on, so no revision time is wasted
• Spaced repetition and past paper AI — questions scheduled at exactly the right time, with 5-year paper analysis for AQA, Edexcel, and OCR
• Teacher dashboard — real-time visibility into every student's predicted grade, mastery by topic, and study activity${offersAlevel ? `
• Both GCSE and A-level content — the platform covers the full specification for both courses in one place` : ''}

WHAT WE ASK IN RETURN

Only two things:

1. Students complete a short baseline assessment before they begin (15–20 minutes, curriculum-aligned to ${courses})
2. Students complete the same assessment at the end of the term, so we can measure progress honestly

That's it. The data helps us prove — or disprove — whether the platform actually moves grades. We want rigorous evidence, not anecdotes.

WHY WE'RE DOING THIS

StudiQ is an early-stage product. We believe it works, but we want school-validated outcome data to prove it. We are not asking for testimonials, publicity, or any financial commitment. We simply want to know: does this help real students?

WHAT THIS LOOKS LIKE IN PRACTICE

• Setup takes under 10 minutes per class — students join with a code you share
• No IT changes — runs in the browser, any device, at home
• You receive a term-end report showing before/after performance by topic and student

If you'd be open to trialling this with one class or year group, I'd love a 20-minute call.

Explore a live demo at studiq.org — no sign-up required.

Thank you for your time.

Warm regards,
The StudiQ Team
hello@studiq.org
studiq.org

P.S. We are covering all costs for this term. There is no upsell, no contract, and no obligation to continue. If the data doesn't show results worth continuing, we'd rather know than not.

---
You're receiving this because ${schoolName} is a secondary school in London that teaches ${courses}.
To opt out, reply with "unsubscribe" and we will remove you immediately and permanently.`

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
        Free AI Maths Tutor for Your<br/>
        <span style="color:#60a5fa;">${courses} Students — No Cost Required</span>
      </h1>
      <p style="color:#5a7aaa;font-size:13px;margin:10px 0 0;">${yearGroups} · AQA · Edexcel · OCR</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;color:#374151;line-height:1.7;font-size:15px;">

      <p style="margin-top:0;">Dear Head of Maths at <strong>${schoolName}</strong>,</p>

      <p>I'm writing on behalf of <strong>StudiQ</strong>, an AI-powered maths tutoring platform built for <strong>${courses}</strong> students. We're offering a small number of London schools <strong>completely free access for a full term</strong> — no budget, no commitment beyond the term.</p>

      <!-- What students get -->
      <div style="background:#f0f6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">What your ${courses} students get</p>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2.1;">
          <li><strong>SPOK</strong> — voice &amp; text AI tutor, step-by-step explanations, adapts to each student's exact gaps</li>
          <li><strong>Knowledge Tracing</strong> — pinpoints the exact subtopics costing marks in ${courses}</li>
          <li><strong>Past paper AI</strong> — 5-year analysis for AQA, Edexcel &amp; OCR; predicts what's likely this year</li>
          <li><strong>Spaced repetition</strong> — questions scheduled at the perfect moment, proven to double retention</li>
          <li><strong>Teacher dashboard</strong> — predicted grades, mastery by topic, and study activity for every student</li>
          ${offersAlevel ? '<li><strong>GCSE &amp; A-level in one place</strong> — full specification coverage for both courses</li>' : ''}
        </ul>
      </div>

      <!-- What we ask -->
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 10px;font-weight:700;color:#111827;font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">What we ask in return</p>
        <ol style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:2.1;">
          <li>Students complete a <strong>short baseline assessment before</strong> they start (15–20 min, ${courses} curriculum)</li>
          <li>Students complete the <strong>same assessment at the end of term</strong> to measure genuine progress</li>
        </ol>
        <p style="margin:14px 0 0;font-size:13px;color:#92400e;">We want rigorous evidence, not anecdotes. If the data doesn't show results, we'd rather know.</p>
      </div>

      <h3 style="color:#111827;font-size:14px;font-weight:700;margin:28px 0 10px;text-transform:uppercase;letter-spacing:0.05em;">In practice</h3>
      <ul style="margin:0;padding-left:18px;font-size:14px;line-height:2.1;color:#374151;">
        <li>Under 10 minutes to set up per class — students join with a code</li>
        <li>No IT changes — browser-based, works on any device at home</li>
        <li>Term-end report: before/after by topic and student</li>
      </ul>

      <!-- CTA -->
      <div style="text-align:center;margin:36px 0 28px;">
        <a href="https://studiq.org" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:-0.01em;">
          Explore StudiQ →
        </a>
        <p style="margin:14px 0 0;font-size:13px;color:#6b7280;">Or simply reply to arrange a 20-minute walkthrough.</p>
      </div>

      <p style="font-size:14px;color:#374151;margin-bottom:4px;">Thank you for your time.</p>
      <p style="font-size:14px;margin:0;color:#374151;">
        Warm regards,<br/>
        <strong>The StudiQ Team</strong><br/>
        <a href="mailto:hello@studiq.org" style="color:#3b82f6;text-decoration:none;">hello@studiq.org</a>
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
