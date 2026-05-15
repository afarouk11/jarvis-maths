'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function GradientCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

const WHO_FOR = [
  {
    title: 'The student who cannot afford a tutor',
    desc: 'Private tutoring costs £60 an hour or more. For most families that simply is not a realistic option, certainly not consistently, and certainly not when it matters most. There is no good reason that level of personal, attentive support should only be available to some students. StudiQ exists to make it the standard.',
    color: '#3b82f6',
  },
  {
    title: 'The student the system was never built for',
    desc: 'Dyslexia, ADHD, and a wide range of other learning differences affect a significant number of students. Most of them spend their entire education quietly adapting to a system that was never designed with them in mind. StudiQ is built for the full range of how people actually learn, not just for the average.',
    color: '#a78bfa',
  },
  {
    title: 'The student who is starting to give up',
    desc: 'Falling behind academically is rarely just an academic problem. It compounds over time. Missed concepts become missed confidence, and missed confidence becomes a student who has quietly decided that learning is not for them. SPOK is built to be endlessly patient and genuinely encouraging, because for some students, that is the thing that makes the difference.',
    color: '#f59e0b',
  },
  {
    title: 'The student who simply wants to do better',
    desc: 'Not every student using StudiQ is struggling. Some simply want to understand where their knowledge is thin, revise more efficiently, and walk into their exams feeling properly prepared. That student is equally welcome here.',
    color: '#22c55e',
  },
]

const VISION = [
  {
    heading: 'A teacher that follows your pace, not the room\'s',
    body: 'In a classroom, the lesson moves forward regardless of who is ready. Students who need a moment longer are left to quietly fall behind, and over time that gap compounds into lost confidence and a belief that the subject simply is not for them. SPOK works the other way around. It waits. It re-explains. It adjusts. The student sets the pace, and the learning follows.',
    color: '#60a5fa',
  },
  {
    heading: 'The companion students actually want to use',
    body: 'There is a real difference between a revision tool and a companion. A tool is something you open under pressure and close when the pressure passes. A companion is something you return to because it knows where you left off, understands how you think, and makes progress feel tangible. That is the standard StudiQ is being built toward.',
    color: '#3b82f6',
  },
  {
    heading: 'Genuinely personal learning for every student',
    body: 'The quality of individual attention a student receives should not depend on what their family can afford. StudiQ is built to close that gap, delivering the kind of patient, adaptive, one-to-one support that has historically only been available to those whose parents could pay for it.',
    color: '#6366f1',
  },
  {
    heading: 'Efficient, not exhausting',
    body: 'Most revision is wasteful. Students spend hours on topics they already understand while quietly avoiding the ones they do not. StudiQ maps each student\'s knowledge precisely and directs their effort toward what actually needs work. The goal is not more hours studying. It is better ones.',
    color: '#f59e0b',
  },
  {
    heading: 'Inclusive by design, not by exception',
    body: 'Accessibility is not an afterthought here, and it is not a premium feature. For StudiQ it is a foundational requirement, built into how the platform explains things, paces content, and responds to each individual student, regardless of how they learn.',
    color: '#a78bfa',
  },
  {
    heading: 'Engaging enough that students keep coming back',
    body: 'The most sophisticated learning platform in the world is worthless if students close it after two minutes. StudiQ is designed to be genuinely interesting to use, responsive, rewarding, and built around the kind of feedback that makes a student want to try the next question rather than put it down.',
    color: '#22c55e',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080c18', color: '#e8f0fe' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.2) 100%)', padding: 1, borderRadius: 10 }}>
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0d1a3a, #1d4ed8)' }}>S</div>
          </div>
          <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>StudiQ</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#6b8cba' }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            Our Mission
          </div>
          <h1 className="text-white mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Anyone should be able<br />to learn anything.
          </h1>
          <p className="leading-relaxed mb-5" style={{ fontSize: 17, color: '#6b8cba' }}>
            Learning something new should not feel like a battle. It should not leave a student feeling slow, behind, or like the subject simply was not made for them. That feeling is not a reflection of ability. It is almost always a reflection of pace. The classroom moved on before the student was ready, and nobody came back for them.
          </p>
          <p className="leading-relaxed mb-5" style={{ fontSize: 17, color: '#6b8cba' }}>
            The difference between a student who struggles and a student who thrives is often just this: one of them had a teacher who followed their pace rather than the timetable. Someone patient enough to explain it a different way, to slow down without making it feel like a problem, and to stay until it actually clicked.
          </p>
          <p className="leading-relaxed mb-5" style={{ fontSize: 17, color: '#6b8cba' }}>
            That kind of support used to require a private tutor. Most students never get it. StudiQ is being built to change that — because everyone, regardless of their background, their learning differences, or where they are starting from, deserves a way to learn that works for them specifically.
          </p>
          <p className="leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            Learning should be accessible. It should be encouraging. And it should never feel out of reach.
          </p>
        </motion.div>

        {/* Mission statement */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
          <GradientCard style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.15) 50%, rgba(59,130,246,0.04) 100%)' }}>
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#6366f1' }}>Our Mission</p>
              <p style={{ fontSize: 20, color: '#e8f0fe', fontFamily: 'var(--font-space-grotesk)', fontWeight: 500, lineHeight: 1.6 }}>
                Anyone and everyone should be able to learn anything they want, with confidence, at their own pace. Not the classroom's pace. Not the curriculum's pace. Theirs. StudiQ exists to make that possible for every student who has ever felt left behind.
              </p>
            </div>
          </GradientCard>
        </motion.div>

        {/* Who it's for */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-14">
          <h2 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Who we build for
          </h2>
          <p className="text-sm mb-6" style={{ color: '#4a6070' }}>Four kinds of student. Each one matters equally.</p>
          <div className="space-y-4">
            {WHO_FOR.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07 }}>
                <GradientCard style={{ background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}08 50%, rgba(59,130,246,0.03) 100%)` }}>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    <div>
                      <p className="font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{item.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#6b8cba' }}>{item.desc}</p>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-14">
          <h2 className="text-white font-semibold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22 }}>
            Where we are going
          </h2>
          <div className="space-y-4">
            {VISION.map((item, i) => (
              <motion.div key={item.heading} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
                <GradientCard style={{ background: `linear-gradient(135deg, ${item.color}22 0%, ${item.color}08 50%, rgba(59,130,246,0.03) 100%)` }}>
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    <div>
                      <p className="font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{item.heading}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#6b8cba' }}>{item.body}</p>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Who we are */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-14">
          <GradientCard>
            <div className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#4a6070' }}>Who we are</p>
              <p className="leading-relaxed mb-4" style={{ color: '#6b8cba', fontSize: 15 }}>
                StudiQ is built by <span className="text-white">Cerebral Options</span>, a small team with a direct stake in the problem we are trying to solve. This was not conceived in a boardroom. It came from the experience of being a student who needed something that did not exist and deciding to build it.
              </p>
              <p className="leading-relaxed" style={{ color: '#6b8cba', fontSize: 15 }}>
                We contributed to the UK SEND Reform consultation because we believe that people building education technology should be engaged with the policy shaping it. Accessible, personalised learning is not a niche concern. It is the future of education, and we intend to be part of building it properly.
              </p>
            </div>
          </GradientCard>
        </motion.div>

        {/* Related links */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/accessibility',     label: 'Accessibility & SEND' },
              { href: '/for-schools',       label: 'For Schools' },
              { href: '/policy-engagement', label: 'Policy Engagement' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-center px-4 py-3 rounded-xl text-sm text-center transition-all hover:text-white"
                style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', color: '#6b8cba' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
