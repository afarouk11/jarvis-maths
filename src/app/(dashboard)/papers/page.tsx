'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Zap, Clock, BookOpen, Plus, FlaskConical, Calculator, Atom } from 'lucide-react'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { MockExamView, type MockPaper } from '@/components/papers/MockExamView'

type ALevelType = 'pure' | 'stats' | 'mechanics'
type GcseType   = 'non-calc' | 'calc'
type PaperType  = ALevelType | GcseType

const ALEVEL_TYPES = [
  { type: 'pure'      as ALevelType, label: 'Pure Maths',  desc: 'Algebra, Calculus, Trigonometry…', icon: <Calculator size={18} />, color: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  accent: '#818cf8' },
  { type: 'stats'     as ALevelType, label: 'Statistics',  desc: 'Probability, Distributions…',      icon: <FlaskConical size={18} />, color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', accent: '#34d399' },
  { type: 'mechanics' as ALevelType, label: 'Mechanics',   desc: 'Kinematics, Forces, Moments…',     icon: <Atom size={18} />,        color: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', accent: '#fbbf24' },
]

const GCSE_TYPES = [
  { type: 'non-calc' as GcseType, label: 'Paper 1 — Non-Calculator', desc: 'Number, Algebra, Geometry — no calculator', icon: <Calculator size={18} />, color: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  accent: '#818cf8' },
  { type: 'calc'     as GcseType, label: 'Paper 2/3 — Calculator',   desc: 'All topics — calculator allowed',            icon: <FlaskConical size={18} />, color: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', accent: '#fbbf24' },
]

interface FreqItem { slug: string; count: number; percent: number; lastYear?: number; due?: boolean }
interface SavedPaperMeta { id: string; title: string; created_at: string; focus_topics: string[]; total_marks: number | null; time_minutes: number | null }

export default function PapersPage() {
  const [level, setLevel]             = useState<'A-Level' | 'GCSE'>('A-Level')
  const [freq, setFreq]               = useState<FreqItem[]>([])
  const [totalPapers, setTotal]       = useState(0)
  const [paperType, setPaperType]     = useState<PaperType>('pure')
  const [generating, setGenerating]   = useState(false)
  const [mockPaper, setMockPaper]     = useState<MockPaper | null>(null)
  const [focusTopics, setFocus]       = useState<string[]>([])
  const [examOpen, setExamOpen]       = useState(false)
  const [savedPapers, setSaved]       = useState<SavedPaperMeta[]>([])
  const [savedLoading, setSavedLoading] = useState(true)

  useEffect(() => {
    // Read student level from profile
    fetch('/api/profile').then(r => r.json()).then(d => {
      const l = d?.profile?.level ?? 'A-Level'
      setLevel(l)
      setPaperType(l === 'GCSE' ? 'non-calc' : 'pure')
    }).catch(() => {})

    loadFreq()
    loadSaved()
  }, [])

  async function loadSaved() {
    setSavedLoading(true)
    const res = await fetch('/api/papers/saved')
    if (res.ok) setSaved((await res.json()).papers ?? [])
    setSavedLoading(false)
  }

  async function openSaved(id: string) {
    const res = await fetch(`/api/papers/saved/${id}`)
    if (!res.ok) return
    const d = await res.json()
    setMockPaper(d.paper)
    setFocus(d.focusTopics ?? [])
    setExamOpen(true)
  }

  async function loadFreq() {
    const res = await fetch('/api/papers/frequency')
    if (res.ok) {
      const d = await res.json()
      setFreq(d.frequency)
      setTotal(d.totalPapers)
    }
  }

  async function generateMock() {
    setGenerating(true)
    const res = await fetch('/api/generate-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperType }),
    })
    const json = await res.json()
    if (res.ok) {
      setMockPaper(json.paper)
      setFocus(json.focusTopics)
      setExamOpen(true)
    }
    setGenerating(false)
  }

  const topicName = (slug: string) => {
    const alevel = AQA_TOPICS.find(t => t.slug === slug)?.name
    const gcse   = GCSE_TOPICS.find(t => t.slug === slug)?.name
    return alevel ?? gcse ?? slug
  }

  const paperTypes  = level === 'GCSE' ? GCSE_TYPES : ALEVEL_TYPES
  const selected    = (paperTypes as any[]).find(p => p.type === paperType) ?? paperTypes[0]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {examOpen && mockPaper && (
        <MockExamView paper={mockPaper} focusTopics={focusTopics} onClose={() => { setExamOpen(false); loadSaved() }} />
      )}

      {/* ── My Papers ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'rgba(139,92,246,0.07)', borderBottom: '1px solid rgba(139,92,246,0.14)' }}>
          <div>
            <h1 className="text-base font-bold text-white">My Papers</h1>
            <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
              {savedLoading ? 'Loading…' : savedPapers.length === 0
                ? 'No papers yet — generate your first one below'
                : `${savedPapers.length} saved paper${savedPapers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={generateMock} disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
            {generating
              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" /> Generating…</>
              : <><Plus size={14} /> Create new paper</>}
          </button>
        </div>

        <AnimatePresence>
          {generating && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)', background: 'rgba(139,92,246,0.04)' }}>
                <Zap size={13} className="text-purple-400 shrink-0" />
                <div>
                  <p className="text-sm text-white">Building your {selected.label} paper…</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>Selecting topics · Writing questions · Preparing worked solutions</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!savedLoading && savedPapers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <FileText size={20} className="text-purple-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">No papers yet</p>
            <p className="text-xs" style={{ color: '#5a7aaa' }}>Choose a paper type below and hit &ldquo;Create new paper&rdquo;.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {savedPapers.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-xs" style={{ color: '#5a7aaa' }}>
                      {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {p.total_marks && <span className="text-xs" style={{ color: '#5a7aaa' }}>{p.total_marks} marks</span>}
                    {p.time_minutes && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#5a7aaa' }}>
                        <Clock size={10} />{p.time_minutes} min
                      </span>
                    )}
                    {p.focus_topics.slice(0, 3).map(t => (
                      <span key={t} className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.15)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => openSaved(p.id)}
                  className="ml-4 shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
                  <FileText size={11} /> Open
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Paper Type + Frequency ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Paper type selector */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm font-semibold text-white">Paper Type</p>
            <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
              {level === 'GCSE' ? 'AQA GCSE Maths — Higher Tier' : 'Choose which section to practice'}
            </p>
          </div>
          <div className="p-5 space-y-3">
            {paperTypes.map(pt => (
              <button key={pt.type} onClick={() => setPaperType(pt.type)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: paperType === pt.type ? pt.color : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${paperType === pt.type ? pt.border : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: paperType === pt.type ? pt.color : 'rgba(255,255,255,0.04)', color: pt.accent }}>
                  {pt.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: paperType === pt.type ? pt.accent : '#e2e8f0' }}>{pt.label}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#5a7aaa' }}>{pt.desc}</p>
                </div>
                {paperType === pt.type && <div className="ml-auto shrink-0 w-2 h-2 rounded-full" style={{ background: pt.accent }} />}
              </button>
            ))}

            <button onClick={generateMock} disabled={generating}
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: selected.color, border: `1px solid ${selected.border}`, color: selected.accent }}>
              {generating
                ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Generating…</>
                : <><Plus size={14} /> Generate {selected.label} Paper</>}
            </button>
          </div>
        </div>

        {/* Topic frequency */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="px-5 py-4" style={{ background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
            <p className="text-sm font-semibold text-white">Topic Frequency</p>
            <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
              {totalPapers > 0 ? `Based on ${totalPapers} past paper${totalPapers > 1 ? 's' : ''}` : 'No past paper data yet'}
            </p>
          </div>
          <div className="p-5">
            {freq.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="mx-auto mb-3 opacity-20 text-amber-400" />
                <p className="text-sm" style={{ color: '#5a7aaa' }}>No frequency data yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {freq.slice(0, 10).map((item, i) => (
                  <div key={item.slug}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-300">{topicName(item.slug)}</span>
                        {item.due && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '10px' }}>DUE</span>
                        )}
                      </div>
                      <span className="text-xs font-mono" style={{ color: '#f59e0b' }}>{item.percent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800">
                      <motion.div className="h-full rounded-full"
                        style={{ background: item.due ? '#ef4444' : i < 3 ? '#f59e0b' : i < 6 ? '#f97316' : '#3b82f6' }}
                        initial={{ width: 0 }} animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
