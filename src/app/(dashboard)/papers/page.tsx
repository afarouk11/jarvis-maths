'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Zap, Clock, BookOpen, Plus, FlaskConical, Calculator, Atom, X, ExternalLink } from 'lucide-react'
import { AQA_TOPICS } from '@/lib/curriculum/aqa-topics'
import { GCSE_TOPICS } from '@/lib/curriculum/gcse-topics'
import { MockExamView, type MockPaper } from '@/components/papers/MockExamView'

type ALevelType = 'pure' | 'stats' | 'mechanics'
type GcseType   = 'non-calc' | 'calc'
type PaperType  = ALevelType | GcseType
type TabId      = 'my-papers' | 'official'
type Board      = 'Edexcel' | 'AQA' | 'OCR'

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

interface PastPaper {
  id: number
  title: string
  board: Board
  year: number
  paper: 1 | 2 | 3
  pdfUrl: string
  msUrl: string
}

const MOCK_PAST_PAPERS: PastPaper[] = [
  { id: 1,  title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'Edexcel', year: 2024, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 2,  title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'Edexcel', year: 2024, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 3,  title: 'A-Level Mathematics Paper 3 (Stats & Mech)',   board: 'Edexcel', year: 2024, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 4,  title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'Edexcel', year: 2023, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 5,  title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'Edexcel', year: 2023, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 6,  title: 'A-Level Mathematics Paper 3 (Stats & Mech)',   board: 'Edexcel', year: 2023, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 7,  title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'Edexcel', year: 2022, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 8,  title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'Edexcel', year: 2022, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 9,  title: 'A-Level Mathematics Paper 3 (Stats & Mech)',   board: 'Edexcel', year: 2022, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 10, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'Edexcel', year: 2019, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 11, title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'Edexcel', year: 2019, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 12, title: 'A-Level Mathematics Paper 3 (Stats & Mech)',   board: 'Edexcel', year: 2019, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 13, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'AQA',     year: 2024, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 14, title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'AQA',     year: 2024, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 15, title: 'A-Level Mathematics Paper 3 (Applied)',        board: 'AQA',     year: 2024, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 16, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'AQA',     year: 2023, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 17, title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'AQA',     year: 2023, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 18, title: 'A-Level Mathematics Paper 3 (Applied)',        board: 'AQA',     year: 2023, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 19, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'AQA',     year: 2021, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 20, title: 'A-Level Mathematics Paper 2 (Pure)',           board: 'AQA',     year: 2021, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 21, title: 'A-Level Mathematics Paper 3 (Applied)',        board: 'AQA',     year: 2021, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 22, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'OCR',     year: 2024, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 23, title: 'A-Level Mathematics Paper 2 (Pure & Stats)',   board: 'OCR',     year: 2024, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 24, title: 'A-Level Mathematics Paper 3 (Pure & Mech)',    board: 'OCR',     year: 2024, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 25, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'OCR',     year: 2023, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 26, title: 'A-Level Mathematics Paper 2 (Pure & Stats)',   board: 'OCR',     year: 2023, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 27, title: 'A-Level Mathematics Paper 3 (Pure & Mech)',    board: 'OCR',     year: 2023, paper: 3, pdfUrl: '#', msUrl: '#' },
  { id: 28, title: 'A-Level Mathematics Paper 1 (Pure)',           board: 'OCR',     year: 2020, paper: 1, pdfUrl: '#', msUrl: '#' },
  { id: 29, title: 'A-Level Mathematics Paper 2 (Pure & Stats)',   board: 'OCR',     year: 2020, paper: 2, pdfUrl: '#', msUrl: '#' },
  { id: 30, title: 'A-Level Mathematics Paper 3 (Pure & Mech)',    board: 'OCR',     year: 2020, paper: 3, pdfUrl: '#', msUrl: '#' },
]

const TOPIC_QUESTIONS = [
  'Differentiation',
  'Integration',
  'Trigonometry',
  'Vectors',
  'Binomial Expansion',
  'Proof',
  'Exponentials & Logarithms',
  'Algebra & Functions',
  'Sequences & Series',
]

const BOARD_STYLE: Record<Board, { bg: string; border: string; color: string }> = {
  Edexcel: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', color: '#818cf8' },
  AQA:     { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', color: '#34d399' },
  OCR:     { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', color: '#fbbf24' },
}

const TOPIC_COLORS = [
  'rgba(99,102,241,0.15)',
  'rgba(16,185,129,0.15)',
  'rgba(245,158,11,0.15)',
  'rgba(239,68,68,0.15)',
  'rgba(59,130,246,0.15)',
  'rgba(168,85,247,0.15)',
  'rgba(20,184,166,0.15)',
  'rgba(249,115,22,0.15)',
  'rgba(236,72,153,0.15)',
]

const TOPIC_ACCENTS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171',
  '#60a5fa', '#c084fc', '#2dd4bf', '#fb923c', '#f472b6',
]

export default function PapersPage() {
  const [level, setLevel]             = useState<'A-Level' | 'GCSE'>('A-Level')
  const [freq, setFreq]               = useState<FreqItem[]>([])
  const [totalPapers, setTotal]       = useState(0)
  const [paperType, setPaperType]     = useState<PaperType>('pure')
  const [generating, setGenerating]   = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [mockPaper, setMockPaper]     = useState<MockPaper | null>(null)
  const [focusTopics, setFocus]       = useState<string[]>([])
  const [examOpen, setExamOpen]       = useState(false)
  const [savedPapers, setSaved]       = useState<SavedPaperMeta[]>([])
  const [savedLoading, setSavedLoading] = useState(true)

  // Tab + Official filters
  const [activeTab, setActiveTab]     = useState<TabId>('my-papers')
  const [boardFilter, setBoardFilter] = useState<Board | 'All'>('All')
  const [yearFilter, setYearFilter]   = useState<number | 'All'>('All')
  const [paperFilter, setPaperFilter] = useState<1 | 2 | 3 | 'All'>('All')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      const l = d?.level ?? 'A-Level'
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
    setGenerateError(null)
    try {
      const res = await fetch('/api/generate-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperType }),
      })
      if (!res.ok) {
        const text = await res.text()
        let msg = `Server error ${res.status}`
        try { const p = JSON.parse(text); msg = [p.error, p.details].filter(Boolean).join(' — ') || msg } catch { msg = text.slice(0, 200) }
        setGenerateError(msg)
      } else {
        const json = await res.json()
        setMockPaper(json.paper)
        setFocus(json.focusTopics)
        setExamOpen(true)
      }
    } catch (err: any) {
      setGenerateError(err?.message ?? 'Network error — please try again')
    } finally {
      setGenerating(false)
    }
  }

  const topicName = (slug: string) => {
    const alevel = AQA_TOPICS.find(t => t.slug === slug)?.name
    const gcse   = GCSE_TOPICS.find(t => t.slug === slug)?.name
    return alevel ?? gcse ?? slug
  }

  const paperTypes = level === 'GCSE' ? GCSE_TYPES : ALEVEL_TYPES
  const selected   = (paperTypes as any[]).find(p => p.type === paperType) ?? paperTypes[0]

  const filteredPapers = MOCK_PAST_PAPERS.filter(p => {
    if (boardFilter !== 'All' && p.board !== boardFilter) return false
    if (yearFilter  !== 'All' && p.year  !== yearFilter)  return false
    if (paperFilter !== 'All' && p.paper !== paperFilter) return false
    return true
  }).sort((a, b) => b.year - a.year || a.paper - b.paper)

  const years = Array.from({ length: 10 }, (_, i) => 2024 - i)

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    padding: '6px 28px 6px 10px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a7aaa'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {examOpen && mockPaper && (
        <MockExamView paper={mockPaper} focusTopics={focusTopics} onClose={() => { setExamOpen(false); loadSaved() }} />
      )}

      {/* Topic questions modal */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#0f1624', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="px-6 py-4 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-sm font-bold text-white">Topic Questions</p>
                  <p className="text-xs mt-0.5" style={{ color: '#fbbf24' }}>{selectedTopic}</p>
                </div>
                <button onClick={() => setSelectedTopic(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: '#5a7aaa' }}>
                  <X size={15} />
                </button>
              </div>
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <BookOpen size={22} style={{ color: '#fbbf24' }} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  Topic questions for {selectedTopic}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#5a7aaa' }}>
                  Curated exam questions on this topic will appear here.<br />
                  PDF viewer coming soon.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-8"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'inline-flex' }}>
        {([
          { id: 'my-papers' as TabId, label: 'My Papers' },
          { id: 'official'  as TabId, label: 'Official Past Papers' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="py-2 px-5 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab.id ? {
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#fbbf24',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: '#5a7aaa',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── My Papers tab ── */}
      {activeTab === 'my-papers' && (
        <div className="space-y-8">

          {/* My Papers section */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
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
              {generateError && !generating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)' }}>
                    <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <div>
                      <p className="text-sm text-red-300">Generation failed — {generateError}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#f87171' }}>Please try again. If the issue persists, check the API key in Vercel settings.</p>
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

          {/* Paper Type + Frequency */}
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
                        <div className="h-1 rounded-full bg-slate-800">
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
      )}

      {/* ── Official Past Papers tab ── */}
      {activeTab === 'official' && (
        <div className="space-y-8">

          {/* Full Past Papers */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold text-white">Full Past Papers</h2>
              <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                A-Level Mathematics — Papers and mark schemes
              </p>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 flex flex-wrap items-center gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-xs font-medium" style={{ color: '#5a7aaa' }}>Filter:</span>

              <div style={{ position: 'relative' }}>
                <select value={boardFilter} onChange={e => setBoardFilter(e.target.value as Board | 'All')} style={selectStyle}>
                  <option value="All">All Boards</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="AQA">AQA</option>
                  <option value="OCR">OCR</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value) as number)} style={selectStyle}>
                  <option value="All">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <select value={paperFilter} onChange={e => setPaperFilter(e.target.value === 'All' ? 'All' : Number(e.target.value) as 1 | 2 | 3)} style={selectStyle}>
                  <option value="All">All Papers</option>
                  <option value={1}>Paper 1</option>
                  <option value={2}>Paper 2</option>
                  <option value={3}>Paper 3</option>
                </select>
              </div>

              <span className="text-xs ml-auto" style={{ color: '#5a7aaa' }}>
                {filteredPapers.length} result{filteredPapers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div>
              {filteredPapers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm" style={{ color: '#5a7aaa' }}>No papers match the selected filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {filteredPapers.map((p, i) => {
                    const bs = BOARD_STYLE[p.board]
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Board badge */}
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md"
                          style={{ background: bs.bg, border: `1px solid ${bs.border}`, color: bs.color, minWidth: 56, textAlign: 'center' }}>
                          {p.board}
                        </span>

                        {/* Title */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{p.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                            {p.year} · Paper {p.paper}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex items-center gap-2">
                          <a
                            href={p.pdfUrl}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
                          >
                            <FileText size={11} /> Paper PDF
                          </a>
                          <a
                            href={p.msUrl}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
                          >
                            <ExternalLink size={11} /> Mark Scheme
                          </a>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Topic Questions */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold text-white">Topic Questions</h2>
              <p className="text-xs mt-0.5" style={{ color: '#5a7aaa' }}>
                Focused question sets by topic
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPIC_QUESTIONS.map((topic, i) => (
                <motion.button
                  key={topic}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedTopic(topic)}
                  className="flex flex-col items-start gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: TOPIC_COLORS[i],
                    border: `1px solid ${TOPIC_ACCENTS[i]}30`,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${TOPIC_ACCENTS[i]}20` }}>
                    <BookOpen size={14} style={{ color: TOPIC_ACCENTS[i] }} />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-sm font-semibold text-white leading-tight">{topic}</p>
                    <p className="text-xs mt-2 font-medium"
                      style={{ color: TOPIC_ACCENTS[i] }}>
                      View Questions →
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
