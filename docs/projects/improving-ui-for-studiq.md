# Project: Improving UI for StudiQ

Making the StudiQ UI student-friendly, simple, and easy to use — informed by research into
leading education platforms (Duolingo, Khan Academy, Brilliant, Sparx) and AI tutors
(Khanmigo, Synthesis, Photomath, ChatGPT Study Mode, Up Learn).

Branch: `claude/student-friendly-ui-plan-itzDg`

---

## Context

StudiQ ("SPOK") is an AI maths tutor for UK GCSE/A-Level students (ages 14–18). The engine is
strong (BKT mastery, spaced repetition, voice AI tutor, past-paper AI) but the student-facing UX
is overloaded and cognitively heavy:

- Dashboard stacks **12+ sections** and competing CTAs — unclear what to do first.
- **Onboarding** packs 4 dense decisions on one screen and never explains jargon.
- **Navigation** exposes 11 destinations (incl. admin) to every student.
- Inconsistent naming (**JARVIS vs SPOK** — should always be **SPOK**), demotivating labels ("Needs Work").
- **Paywall modals** interrupt at the moment of frustration.
- **Math input** is hand-typed LaTeX or a 7-symbol keypad.
- **Accessibility** features are powerful but hidden behind a desktop-only button.
- Hard-coded hex colours and 12px text everywhere hurt consistency/readability.

Goal: a simpler, guided, mobile-first experience that always answers "what do I do next?", explains
itself in plain language, and softens monetisation — keeping the powerful engine underneath.

Direction: full student-friendly overhaul · soften & pre-warn upsell · keep dark theme but fix
contrast/text-size (no new light theme). Delivered in independently-shippable phases.

---

## Phases & status

- [x] **Foundations** — semantic design tokens, 15px base text, focus rings, `<HelpTip>` + glossary, `friendlyError()` helper
- [x] **Phase 1 — Navigation** — sidebar cut to 5 daily items + "More" group; admin removed; bigger tap targets; friendlier mobile labels
- [x] **Phase 2 — Dashboard** — "Your next step" hero, HelpTips on stat labels, removed dense recommendation bar, "Needs Work" → "Focus next"
- [x] **Phase 3 — Onboarding** — plain-language explainers (exam board, target grade), mobile-friendly grade grid, compact mobile SPOK greeting
- [x] **Phase 4 — Practice & math input** — bigger grouped/labelled math keypad with aria-labels, keypad on its own row
- [x] **Phase 5 — Friendly states** — `friendlyError()` wired into practice; friendly error header + "Try again" button
- [ ] **Phase 6 — Soften upsell** — pre-warn before limits, calm inline banner instead of frustration-moment modal *(remaining — touches the 1172-line SPOK chat; do carefully)*
- [x] **Phase 7 — Accessibility** — accessibility panel now reachable on mobile, aria-labels, bigger tap target *(presets + diagram alt text still to do)*

## Competitive differentiation (fold into phases)

**Tier 1 (do first):** open student-facing mastery model ("Brain Map"); structural (non-bypassable)
anti-answer hint ladder; exam-board switcher front-and-centre; "anti-Photomath" parent/teacher
independence score.
**Tier 2:** SPOK voice + synchronised live diagrams; best-in-class math input (photo/OCR);
past-paper AI as adaptive examiner-marked mocks.
**Tier 3:** trust signals (UK GDPR/DfE, exam-spec badges); explicit anti-Sparx positioning;
spaced-repetition as a visible daily "due today" loop.

## Key files

- `src/app/globals.css` — design tokens, base text, focus rings
- `src/components/ui/HelpTip.tsx` + `src/lib/glossary.ts` — jargon explainers
- `src/lib/friendly-error.ts` — friendly error mapping
- `src/components/layout/Sidebar.tsx` — navigation
- `src/app/(dashboard)/dashboard/page.tsx` — dashboard
- `src/app/onboarding/page.tsx` — onboarding
- `src/app/(dashboard)/practice/page.tsx`, `src/components/math/*` — practice & math input
- `src/components/accessibility/AccessibilityPanel.tsx` — accessibility

## Verification

- `npm install` then `npm run build` and `npm run lint` (strict TS — no `any`, explicit return types).
  *Note: this remote environment has no `node_modules`, so type-check/build must be run after install.*
- `npm run dev` and walk the core journey at 375/768/1280px widths.
- Keyboard-tab for visible focus; contrast check on new tokens; confirm min 14px body text.
- Business logic (BKT, SM-2, exam readiness, AI prompts) is untouched — presentation/composition only.

## Non-goals

- No new light theme (dark + improved contrast only).
- Full math-editor (MathLive) flagged as a follow-up, not committed.
