'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { StudiQLogo } from '@/components/ui/StudiQLogo'
import { Check, Brain, Zap, BarChart2, BookOpen, FileText, Users } from 'lucide-react'

const VIDEO_ID = '5lNYCryUae0'

const FEATURES = [
  {
    icon: <Brain size={20} />,
    title: 'Knows exactly what each student doesn\'t know',
    desc: 'Bayesian Knowledge Tracing maps every student\'s gaps down to the subtopic — with no wasted revision time.',
    color: '#3b82f6',
  },
  {
    icon: <Zap size={20} />,
    title: 'SPOK — voice & text AI tutor',
    desc: 'Students ask questions out loud or by typing. SPOK explains step-by-step, marks answers, and adapts instantly.',
    color: '#f59e0b',
  },
  {
    icon: <FileText size={20} />,
    title: 'Past paper AI for AQA, Edexcel & OCR',
    desc: '5-year paper analysis predicts what\'s likely to come up. Students practise the right questions at the right time.',
    color: '#a78bfa',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Spaced repetition built in',
    desc: 'The SM-2 algorithm schedules each topic review at the exact moment before a student forgets it.',
    color: '#22c55e',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Teacher dashboard',
    desc: 'See every student\'s predicted grade, mastery by topic, daily activity, and streak — all in one place.',
    color: '#f97316',
  },
  {
    icon: <Users size={20} />,
    title: 'Works for whole classes',
    desc: 'Share a class code. Students join in under a minute. No IT setup, no app install — just a browser.',
    color: '#60a5fa',
  },
]

const WHAT_WE_ASK = [
  'Students complete a baseline maths assessment before they start (50 min — we provide it)',
  'Students complete the same assessment at the end of term',
  'That\'s it — we use the data to measure whether StudiQ actually works',
]

const INCLUDES = [
  'Full platform access for all your GCSE & A-level Maths students',
  'Teacher dashboard with live progress tracking',
  'AQA, Edexcel and OCR past paper AI',
  'Term-end progress report per student',
  'Setup support from Muhammad directly',
]

export default function SchoolsPage() {
  return (
    <div className="min-h-screen notebook-bg" style={{ color: '#e8f0fe' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(8,12,24,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="flex items-center justify-between px-6 md:px-10 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <StudiQLogo size={30} />
            <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="mailto:admin@studiq.org"
              className="hidden md:block px-4 py-2 text-sm transition-colors hover:text-white"
              style={{ color: '#6b8cba' }}>
              admin@studiq.org
            </a>
            <Link href="/sign-up">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
                Try it free
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-32 px-4 md:px-6 max-w-5xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Summer Programme + Autumn Term — no budget required
          </div>

          <h1 className="text-white mb-5 text-4xl md:text-[52px]"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            The AI maths tutor your<br />
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              students actually need
            </span>
          </h1>

          <p className="max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            StudiQ gives every student a personalised AI tutor that finds their exact gaps,
            explains maths step-by-step, and tracks their progress toward their target grade.
            Free for your school this summer and next term.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/guest" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 0 40px rgba(59,130,246,0.35)', fontSize: 15 }}>
                Try it free now →
              </motion.button>
            </Link>
            <a href="mailto:admin@studiq.org?subject=School trial enquiry" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 15 }}>
                Book a call with Muhammad
              </motion.button>
            </a>
          </div>
        </motion.div>

        {/* Video */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-20 rounded-2xl overflow-hidden relative"
          style={{ border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 60px rgba(59,130,246,0.1)' }}>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
              title="StudiQ demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </motion.div>

        {/* Two offers */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-20">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#4ade80' }}>What we're offering</p>
          <h2 className="text-center text-white mb-8"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 28, fontWeight: 700 }}>
            Two free programmes — starting this summer
          </h2>
          <div className="grid md:grid-cols-2 gap-5">

            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">☀️</span>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4ade80' }}>Summer Programme</p>
              </div>
              <p className="text-white font-semibold mb-2" style={{ fontSize: 17 }}>July &amp; August</p>
              <p style={{ color: '#6b8cba', fontSize: 14, lineHeight: 1.7 }}>
                For students who want a head start before September — incoming Year 12s building on their GCSE,
                Year 13 resitters, or anyone who wants to arrive in September ahead of the curve.
                Students work through StudiQ independently at their own pace over the summer.
              </p>
            </div>

            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📚</span>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#60a5fa' }}>Autumn Term</p>
              </div>
              <p className="text-white font-semibold mb-2" style={{ fontSize: 17 }}>From September</p>
              <p style={{ color: '#6b8cba', fontSize: 14, lineHeight: 1.7 }}>
                Free access for all your GCSE &amp; A-level Maths students for the entire autumn term,
                with the teacher dashboard so you can track every student's predicted grade
                and progress from day one.
              </p>
            </div>

          </div>
        </motion.div>

        {/* What we ask */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="rounded-2xl p-8 mb-20"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#fbbf24' }}>No budget. No contract.</p>
          <h2 className="text-center text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 24, fontWeight: 700 }}>
            We only ask for two things
          </h2>
          <p className="text-center mb-8 max-w-lg mx-auto" style={{ color: '#6b8cba', fontSize: 15 }}>
            We want to prove this works with real data, not testimonials.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-semibold text-white mb-3">What you get</p>
              <ul className="space-y-2">
                {INCLUDES.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-semibold text-white mb-3">What we ask</p>
              <ul className="space-y-2">
                {WHAT_WE_ASK.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-center text-white mb-10"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Everything included
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <p className="text-sm font-semibold text-white mb-1.5">{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(99,102,241,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 className="text-white mb-3"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Ready to try it with your students?
          </h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: '#6b8cba', fontSize: 15 }}>
            Sign up free and explore the full platform — or get in touch directly and
            Muhammad will set everything up for you personally.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/guest" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', fontSize: 15 }}>
                Try it free now →
              </motion.button>
            </Link>
            <a href="mailto:admin@studiq.org?subject=School trial enquiry — summer + autumn" className="w-full sm:w-auto">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 15 }}>
                Email Muhammad directly
              </motion.button>
            </a>
          </div>
          <p className="mt-6 text-xs" style={{ color: '#3a4a5c' }}>
            No credit card. No commitment. Free for the summer and the whole autumn term.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
