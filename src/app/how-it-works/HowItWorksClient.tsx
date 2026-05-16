'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Brain, BookOpen, FileText, MessageSquare, BarChart2, Layers } from 'lucide-react'

function GradientCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(99,102,241,0.15) 50%, rgba(59,130,246,0.05) 100%)', padding: 1, borderRadius: 18, ...style }}>
      <div style={{ background: 'rgba(10,14,26,0.95)', borderRadius: 17, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: <Brain size={24} />,
    color: '#3b82f6',
    label: 'Knowledge Profiling',
    title: 'StudiQ learns exactly what you know and what you do not.',
    problem: 'Most students sit down to revise without any real sense of where their time is best spent. They work through topics they already understand because it feels productive, while the gaps that will actually cost them marks go untouched.',
    solution: 'Using a method called Bayesian Knowledge Tracing, StudiQ builds a precise, live model of every student\'s understanding across all topics. Not a rough estimate. A specific, continuously updated map of where their knowledge is solid and where it is not. Every answer a student gives feeds into that model and sharpens it further.',
  },
  {
    icon: <Layers size={24} />,
    color: '#a78bfa',
    label: 'Learning Profile',
    title: 'Your strengths and weaknesses, mapped in detail.',
    problem: 'Teachers work with thirty students at once. Even the most attentive one cannot hold a detailed picture of where every individual student stands on every topic. Students rarely know themselves either, and what they think they understand often differs from what they can actually do under pressure.',
    solution: 'StudiQ builds and maintains a personal learning profile for each student. It tracks performance over time, identifies patterns in where mistakes cluster, and distinguishes between topics a student genuinely understands and topics they have only surface-level familiarity with. The profile grows more accurate the more the student uses it.',
  },
  {
    icon: <BookOpen size={24} />,
    color: '#22c55e',
    label: 'Lesson Generation',
    title: 'Lessons built around your gaps, not a generic syllabus.',
    problem: 'Standard lessons are written for the average student. They cover content in a fixed order, at a fixed depth, regardless of what any individual actually needs. A student who already understands integration but struggles with trigonometric identities gets the same lesson as everyone else.',
    solution: 'StudiQ generates targeted lessons based on each student\'s specific profile. If the knowledge map identifies a weak area, a lesson is created to address precisely that gap, with worked examples, step-by-step explanations, and follow-up questions designed to consolidate understanding rather than simply expose it.',
  },
  {
    icon: <MessageSquare size={24} />,
    color: '#f59e0b',
    label: '24/7 AI Tutor',
    title: 'A tutor that is always available, always patient, and entirely focused on you.',
    problem: 'Good tutoring is expensive and time-limited. A student who gets stuck at eleven o\'clock the night before an exam has nowhere to turn. Even those with tutors get one hour a week, and that hour rarely lands at the moment the confusion actually happens.',
    solution: 'SPOK is available at any hour, for any question, without time pressure and without judgment. It explains concepts step by step, answers follow-up questions, adjusts its explanations when something is not landing, and never makes a student feel like asking again is a problem. The conversation is always on the student\'s terms, moving at whatever pace they need.',
  },
  {
    icon: <FileText size={24} />,
    color: '#f472b6',
    label: 'Predicted Paper Generation',
    title: 'Know what is likely to come up before you walk into the exam.',
    problem: 'Exam papers are not random. Certain topic combinations, question styles, and mark weightings recur across years. Students who revise without any awareness of this are preparing for a version of the exam that may not reflect what is actually tested.',
    solution: 'StudiQ analyses historical papers across AQA, Edexcel, and OCR to identify patterns in what gets tested, how often, and in what form. It uses that analysis to generate mock papers that reflect what is statistically most likely to appear, weighted against each student\'s weaker areas so that the practice is as targeted as it is realistic.',
  },
  {
    icon: <BarChart2 size={24} />,
    color: '#60a5fa',
    label: 'Progress Intelligence',
    title: 'A clear picture of how far you have come and what remains.',
    problem: 'Revision without feedback is guesswork. Students rarely know whether the hours they are putting in are translating into real understanding, or whether they are covering the same ground repeatedly without actually improving.',
    solution: 'StudiQ tracks progress across every session and surfaces it clearly. Students can see which topics have moved from weak to confident, where they are still losing marks, and how their overall readiness has changed over time. It turns studying from an act of faith into something measurable.',
  },
]

export default function HowItWorksPage() {
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

      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
            What StudiQ Does
          </div>
          <h1 className="text-white mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Built around the student.<br />Not the syllabus.
          </h1>
          <p className="max-w-2xl leading-relaxed mb-5" style={{ fontSize: 17, color: '#6b8cba' }}>
            Every feature in StudiQ was designed to solve a specific, real problem that students face. Not to look impressive on a feature list, but to address the actual reasons students fall behind, lose confidence, or walk into exams underprepared.
          </p>
          <p className="max-w-2xl leading-relaxed" style={{ fontSize: 17, color: '#6b8cba' }}>
            Below is what StudiQ does and, more importantly, why each part of it exists.
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}>
              <GradientCard style={{ background: `linear-gradient(135deg, ${f.color}20 0%, ${f.color}08 60%, rgba(59,130,246,0.03) 100%)` }}>
                <div className="p-8">

                  {/* Label + icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${f.color}18`, border: `1px solid ${f.color}28`, color: f.color }}>
                      {f.icon}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: f.color }}>
                      {f.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-white font-semibold mb-6"
                    style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20, lineHeight: 1.4 }}>
                    {f.title}
                  </h2>

                  {/* Problem / Solution */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#374151' }}>
                        The problem
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#5a7aaa' }}>{f.problem}</p>
                    </div>
                    <div style={{ borderLeft: `1px solid ${f.color}18`, paddingLeft: 24 }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: f.color, opacity: 0.7 }}>
                        What StudiQ does
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#94b4f0' }}>{f.solution}</p>
                    </div>
                  </div>

                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20">
          <p className="mb-6" style={{ color: '#5a7aaa', fontSize: 15 }}>
            Everything above is available to every student, free to start.
          </p>
          <Link href="/sign-up">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-xl font-semibold text-white"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                boxShadow: '0 0 40px rgba(59,130,246,0.35)',
                fontSize: 15,
              }}>
              Start learning free →
            </motion.button>
          </Link>
          <p className="text-xs mt-4" style={{ color: '#2d3a4a' }}>No credit card required</p>
        </motion.div>

      </div>
    </div>
  )
}
