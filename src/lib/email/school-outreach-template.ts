export function schoolOutreachEmail(schoolName: string): { subject: string; html: string; text: string } {
  const subject = `Free AI Maths Tutor for Your Students This Term — No Cost, Just Results`

  const text = `Dear Head of Maths,

I'm writing on behalf of StudiQ, an AI-powered maths tutoring platform built specifically for GCSE and A-level students. We're reaching out to a small number of schools this term with an offer to provide completely free access to all your students — no budget required, no commitment beyond this term.

WHAT WE'RE PROPOSING

We would give every student in your chosen year group(s) full access to StudiQ's platform for one complete term, including:

• SPOK — a voice and text AI tutor that explains maths step-by-step, answers questions out loud, and adapts to each student's exact knowledge gaps
• Bayesian Knowledge Tracing — a diagnostic engine that pinpoints precisely which subtopics each student is weak on, so no revision time is wasted
• Spaced repetition and past paper AI — questions scheduled at exactly the right time, with 5-year paper analysis for AQA, Edexcel, and OCR
• Teacher dashboard — real-time visibility into every student's predicted grade, mastery by topic, and streak activity

WHAT WE ASK IN RETURN

Only two things:

1. Students complete a short baseline assessment before they begin using the platform (15–20 minutes, curriculum-aligned)
2. Students complete the same assessment at the end of the term, so we can measure progress honestly

That's it. The data helps us prove — or disprove — whether the platform actually moves grades. We want rigorous evidence, not anecdotes.

WHY WE'RE DOING THIS

StudiQ is an early-stage product. We believe it works, but we want school-validated outcome data to prove it. We are not asking for testimonials, publicity, or any financial commitment. We simply want to know: does this help real students?

WHAT THIS LOOKS LIKE IN PRACTICE

• Setup takes under 10 minutes per class (students sign up with a class code you share)
• No IT infrastructure changes — runs entirely in the browser, any device
• Students use it independently, at home
• You receive a term-end report showing before/after performance by topic and student

If you'd be open to trialling this with one class or year group, I'd love a 20-minute call.

You can explore a live demo at studiq.org right now — no sign-up required.

Thank you for your time.

Warm regards,
The StudiQ Team
hello@studiq.org
studiq.org

P.S. We are covering all costs for this term. There is no upsell, no contract, and no obligation to continue. If the data doesn't show results worth continuing, we'd rather know than not.

---
You're receiving this because ${schoolName} is a secondary school in London. To opt out, reply with "unsubscribe" and we will remove you immediately.`

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
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="width:36px;height:36px;background:#1d3a7a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#3b82f6;font-weight:800;font-size:18px;">S</span>
        </div>
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">StudiQ</span>
      </div>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;line-height:1.3;letter-spacing:-0.02em;">
        Free AI Maths Tutor for Your Students<br/>
        <span style="color:#60a5fa;">This Term — No Cost Required</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;color:#374151;line-height:1.7;font-size:15px;">

      <p style="margin-top:0;">Dear Head of Maths at <strong>${schoolName}</strong>,</p>

      <p>I'm writing on behalf of <strong>StudiQ</strong>, an AI-powered maths tutoring platform built specifically for GCSE and A-level students. We're reaching out to a small number of London schools this term with an offer to provide <strong>completely free access to all your students</strong> — no budget required, no commitment beyond this term.</p>

      <!-- What we offer -->
      <div style="background:#f8faff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">What your students get</p>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
          <li><strong>SPOK</strong> — a voice &amp; text AI tutor that explains maths step-by-step and adapts to each student's exact knowledge gaps</li>
          <li><strong>Bayesian Knowledge Tracing</strong> — pinpoints the exact subtopics costing marks, so no revision time is wasted</li>
          <li><strong>Spaced repetition + past paper AI</strong> — 5-year paper analysis for AQA, Edexcel, and OCR</li>
          <li><strong>Teacher dashboard</strong> — real-time view of every student's predicted grade, mastery by topic, and study activity</li>
        </ul>
      </div>

      <!-- What we ask -->
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">What we ask in return</p>
        <p style="margin:0 0 8px;font-size:14px;">Only two things:</p>
        <ol style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
          <li>Students complete a <strong>short baseline assessment before</strong> they begin (15–20 min, curriculum-aligned)</li>
          <li>Students complete the <strong>same assessment at the end of term</strong> so we can measure progress honestly</li>
        </ol>
        <p style="margin:12px 0 0;font-size:13px;color:#6b7280;">We want rigorous evidence, not anecdotes. If the data doesn't show results worth continuing, we'd rather know than not.</p>
      </div>

      <!-- Practical details -->
      <h3 style="color:#111827;font-size:15px;margin:28px 0 12px;">What this looks like in practice</h3>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:2;color:#374151;">
        <li>Setup takes <strong>under 10 minutes per class</strong> — students join with a code you share</li>
        <li>No IT changes — runs entirely in the browser, any device, at home</li>
        <li>Term-end report showing before/after performance by topic and student</li>
      </ul>

      <!-- CTA -->
      <div style="text-align:center;margin:36px 0 24px;">
        <a href="https://studiq.org" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
          Explore StudiQ →
        </a>
        <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Or reply to this email to arrange a 20-minute call.</p>
      </div>

      <p style="font-size:14px;color:#374151;">Thank you for your time.</p>

      <p style="font-size:14px;margin-bottom:0;color:#374151;">
        Warm regards,<br/>
        <strong>The StudiQ Team</strong><br/>
        <a href="mailto:hello@studiq.org" style="color:#3b82f6;">hello@studiq.org</a> ·
        <a href="https://studiq.org" style="color:#3b82f6;">studiq.org</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;font-size:12px;color:#9ca3af;line-height:1.6;">
      <p style="margin:0;">You're receiving this because ${schoolName} is a secondary school in London.</p>
      <p style="margin:4px 0 0;">To opt out, reply with "unsubscribe" and we will remove you immediately and permanently.</p>
    </div>
  </div>
</body>
</html>`

  return { subject, html, text }
}
