'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MixedMath } from '@/components/math/MathRenderer'
import { X, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Trophy, BookmarkPlus, BookmarkCheck } from 'lucide-react'

interface WorkedStep { label: string; content: string }
interface MockQuestion {
  number: number; topic: string; marks: number; stem: string
  diagram?: string
  answer: string; worked_solution: WorkedStep[]
}
interface MockSection { name: string; questions: MockQuestion[] }
export interface MockPaper {
  title: string; totalMarks: number; timeMinutes: number; sections: MockSection[]
}

interface QuestionState {
  studentAnswer: string
  marking: boolean
  result: { correct: boolean; quality: number; feedback: string; partialCredit: boolean } | null
  marksEarned: number
  revealed: boolean
}

export function MockExamView({ paper, focusTopics, onClose }: {
  paper: MockPaper
  focusTopics: string[]
  onClose: () => void
}) {
  const allQuestions = paper.sections.flatMap(s => s.questions)

  const [states, setStates] = useState<Record<number, QuestionState>>(() =>
    Object.fromEntries(allQuestions.map(q => [q.number, {
      studentAnswer: '', marking: false, result: null, marksEarned: 0, revealed: false,
    }]))
  )
  const [expandedSolutions, setExpandedSolutions] = useState<Set<number>>(new Set())
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  async function savePaper() {
    setSaving(true)
    setSaveErr(null)
    try {
      const res = await fetch('/api/papers/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper, focusTopics }),
      })
      if (res.ok) {
        setSaved(true)
      } else {
        const json = await res.json().catch(() => ({}))
        setSaveErr(json.error ?? `Error ${res.status}`)
      }
    } catch (err: any) {
      setSaveErr(err.message ?? 'Network error')
    }
    setSaving(false)
  }

  function updateState(num: number, patch: Partial<QuestionState>) {
    setStates(prev => ({ ...prev, [num]: { ...prev[num], ...patch } }))
  }

  async function markQuestion(q: MockQuestion) {
    const s = states[q.number]
    if (!s.studentAnswer.trim()) return
    updateState(q.number, { marking: true })
    const res = await fetch('/api/mark-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stem: q.stem,
        correctAnswer: q.answer,
        studentAnswer: s.studentAnswer,
        workedSolution: q.worked_solution,
      }),
    })
    const result = await res.json()
    const marksEarned = result.correct
      ? q.marks
      : result.partialCredit
        ? Math.round(q.marks * (result.quality / 5))
        : 0
    updateState(q.number, { marking: false, result, marksEarned, revealed: false })
  }

  function toggleSolution(num: number) {
    setExpandedSolutions(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      return next
    })
    updateState(num, { revealed: true })
  }

  const answered   = allQuestions.filter(q => states[q.number].result !== null)
  const totalEarned = answered.reduce((s, q) => s + states[q.number].marksEarned, 0)
  const totalAvail  = answered.reduce((s, q) => s + q.marks, 0)
  const allDone     = answered.length === allQuestions.length

  const pct = totalAvail > 0 ? Math.round((totalEarned / paper.totalMarks) * 100) : 0
  const grade = pct >= 80 ? 'A*' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'U'
  const gradeColor = grade === 'A*' ? '#fbbf24' : grade === 'A' ? '#4ade80' : grade === 'B' ? '#60a5fa' : grade === 'C' ? '#94a3b8' : '#ef4444'

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ background: '#1a1f2e' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(8,13,25,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#5a7aaa' }}>
            <X size={14} /> Exit paper
          </button>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-sm text-white font-medium">{paper.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-0.5">
            <button
              onClick={savePaper}
              disabled={saving || saved}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-60"
              style={saved
                ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
                : saveErr
                  ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                  : { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
              {saved
                ? <><BookmarkCheck size={13} /> Saved</>
                : saving
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : <><BookmarkPlus size={13} /> Save paper</>}
            </button>
            {saveErr && (
              <span className="text-xs" style={{ color: '#f87171' }}>{saveErr}</span>
            )}
          </div>
          <span className="text-xs" style={{ color: '#5a7aaa' }}>{paper.timeMinutes} min · {paper.totalMarks} marks</span>
          {answered.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: '#5a7aaa' }}>{totalEarned}/{totalAvail > 0 ? totalAvail : '—'}</span>
              {allDone && (
                <span className="font-bold px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${gradeColor}20`, color: gradeColor, border: `1px solid ${gradeColor}40` }}>
                  {grade}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Paper */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="exam-paper rounded-sm shadow-2xl overflow-hidden" style={{ background: '#fefefe', fontFamily: "'Times New Roman', Times, serif" }}>

          {/* AQA-style exam header */}
          <div style={{ borderBottom: '3px solid #000', padding: '20px 40px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'Arial, sans-serif', letterSpacing: 2, color: '#000', fontWeight: 700 }}>
                  A-LEVEL
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#000', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
                  MATHEMATICS
                </div>
                <div style={{ fontSize: 13, color: '#000', marginTop: 6, fontFamily: 'Arial, sans-serif' }}>
                  {paper.title}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#000', letterSpacing: 1 }}>AQA</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Time allowed: {paper.timeMinutes} minutes</div>
                <div style={{ fontSize: 11, color: '#444' }}>Total marks: {paper.totalMarks}</div>
              </div>
            </div>
          </div>

          {/* Instructions box */}
          <div style={{ padding: '14px 40px', borderBottom: '1px solid #ccc', background: '#f9f9f9' }}>
            <div style={{ fontSize: 11, fontFamily: 'Arial, sans-serif', color: '#222', lineHeight: 1.7 }}>
              <strong>Instructions</strong>
              <ul style={{ margin: '4px 0 0 16px', paddingLeft: 0 }}>
                <li>Answer <strong>all</strong> questions.</li>
                <li>Show all working — marks may be awarded for correct working even if the final answer is wrong.</li>
                <li>Calculators may be used.</li>
              </ul>
            </div>
          </div>

          {/* Questions */}
          <div style={{ padding: '0 40px 40px' }}>
            {paper.sections.map((section, si) => (
              <div key={si}>
                {/* Section header */}
                <div style={{
                  margin: '24px -40px 0',
                  padding: '10px 40px',
                  background: '#f0f0f0',
                  borderTop: '1px solid #ccc',
                  borderBottom: '1px solid #ccc',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#000',
                  letterSpacing: 1,
                }}>
                  {section.name.toUpperCase()}
                </div>

                {section.questions.map((q, qi) => {
                  const st = states[q.number]
                  const expanded = expandedSolutions.has(q.number)
                  const isCorrect = st.result?.correct
                  const isPartial = st.result?.partialCredit && !st.result?.correct

                  return (
                    <div key={q.number} style={{
                      paddingTop: 28,
                      paddingBottom: 8,
                      borderBottom: qi < section.questions.length - 1 ? '1px dashed #ddd' : 'none',
                    }}>
                      {/* Question stem */}
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#000', minWidth: 24, paddingTop: 1 }}>
                          {q.number}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: '#111', lineHeight: 1.7 }}>
                            <MixedMath content={q.stem} />
                          </div>

                          {/* Diagram */}
                          {q.diagram && (
                            <div style={{
                              margin: '14px 0',
                              padding: '12px',
                              background: '#f8f9fa',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                              dangerouslySetInnerHTML={{ __html: q.diagram }}
                            />
                          )}

                          {/* Marks box */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <div style={{
                              border: '1px solid #999', padding: '2px 8px',
                              fontSize: 12, fontFamily: 'Arial, sans-serif', color: '#000',
                            }}>
                              [{q.marks} mark{q.marks !== 1 ? 's' : ''}]
                            </div>
                          </div>

                          {/* Answer lines + textarea overlay */}
                          <div style={{ marginTop: 16, position: 'relative' }}>
                            <div style={{ color: '#888', fontSize: 11, fontFamily: 'Arial, sans-serif', marginBottom: 6 }}>
                              Answer space:
                            </div>
                            <textarea
                              value={st.studentAnswer}
                              onChange={e => updateState(q.number, { studentAnswer: e.target.value })}
                              disabled={!!st.result}
                              placeholder="Write your answer here..."
                              rows={Math.max(3, q.marks + 1)}
                              style={{
                                width: '100%',
                                fontFamily: "'Times New Roman', Times, serif",
                                fontSize: 14,
                                color: '#000',
                                backgroundColor: st.result ? '#f9fafb' : '#fff',
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d0d7de 31px, #d0d7de 32px)',
                                border: '1px solid #aaa',
                                borderRadius: 0,
                                padding: '8px 10px',
                                resize: 'vertical',
                                outline: 'none',
                                lineHeight: '2.2',
                              }}
                            />

                            {/* Marks awarded badge */}
                            {st.result && (
                              <div style={{
                                position: 'absolute',
                                top: 28,
                                right: -36,
                                fontFamily: 'Arial, sans-serif',
                                fontSize: 12,
                                fontWeight: 700,
                                color: isCorrect ? '#15803d' : isPartial ? '#b45309' : '#dc2626',
                                textAlign: 'center',
                                minWidth: 28,
                              }}>
                                {st.marksEarned}<span style={{ fontSize: 9, display: 'block', fontWeight: 400 }}>/{q.marks}</span>
                              </div>
                            )}
                          </div>

                          {/* Mark button / result */}
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {!st.result ? (
                              <button
                                onClick={() => markQuestion(q)}
                                disabled={!st.studentAnswer.trim() || st.marking}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-all disabled:opacity-40"
                                style={{
                                  background: '#1d4ed8', color: '#fff',
                                  border: 'none', fontFamily: 'Arial, sans-serif',
                                  cursor: st.studentAnswer.trim() ? 'pointer' : 'not-allowed',
                                }}>
                                {st.marking
                                  ? <><Loader2 size={11} className="animate-spin" /> Marking...</>
                                  : 'Submit answer'}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                {isCorrect
                                  ? <CheckCircle size={14} style={{ color: '#15803d' }} />
                                  : isPartial
                                    ? <CheckCircle size={14} style={{ color: '#b45309' }} />
                                    : <XCircle size={14} style={{ color: '#dc2626' }} />}
                                <span style={{
                                  fontSize: 12, fontFamily: 'Arial, sans-serif',
                                  color: isCorrect ? '#15803d' : isPartial ? '#b45309' : '#dc2626',
                                }}>
                                  {isCorrect ? 'Correct' : isPartial ? 'Partially correct' : 'Incorrect'}
                                  {' — '}{st.marksEarned}/{q.marks} marks
                                </span>
                              </div>
                            )}

                            {st.result && (
                              <button
                                onClick={() => toggleSolution(q.number)}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded"
                                style={{
                                  background: '#f3f4f6', color: '#374151',
                                  border: '1px solid #d1d5db', fontFamily: 'Arial, sans-serif',
                                }}>
                                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                {expanded ? 'Hide' : 'Show'} worked solution
                              </button>
                            )}
                          </div>

                          {/* AI Feedback */}
                          {st.result?.feedback && (
                            <div style={{
                              marginTop: 10, padding: '8px 12px',
                              background: '#fffbeb', border: '1px solid #fcd34d',
                              borderRadius: 4, fontSize: 12, color: '#92400e',
                              fontFamily: 'Arial, sans-serif', lineHeight: 1.6,
                            }}>
                              <strong>SPOK:</strong> {st.result.feedback}
                            </div>
                          )}

                          {/* Worked solution */}
                          <AnimatePresence>
                            {expanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: 'hidden' }}>
                                <div style={{
                                  marginTop: 14, padding: '14px 16px',
                                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                                  borderRadius: 4,
                                }}>
                                  <div style={{ fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 700, color: '#15803d', marginBottom: 10 }}>
                                    WORKED SOLUTION
                                  </div>
                                  {q.worked_solution.map((step, i) => (
                                    <div key={i} style={{
                                      marginBottom: 10, paddingLeft: 12,
                                      borderLeft: '2px solid #4ade80',
                                    }}>
                                      <div style={{ fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 700, color: '#166534', marginBottom: 3 }}>
                                        {step.label}
                                      </div>
                                      <div style={{ fontSize: 13, color: '#000', lineHeight: 1.6 }}>
                                        <MixedMath content={step.content} />
                                      </div>
                                    </div>
                                  ))}
                                  <div style={{
                                    marginTop: 12, padding: '8px 12px',
                                    background: '#dcfce7', border: '1px solid #4ade80',
                                    borderRadius: 4,
                                  }}>
                                    <div style={{ fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                                      ANSWER
                                    </div>
                                    <div style={{ fontSize: 13, color: '#000' }}>
                                      <MixedMath content={q.answer} />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Paper footer */}
          <div style={{
            padding: '14px 40px',
            borderTop: '2px solid #000',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'Arial, sans-serif',
            fontSize: 11,
            color: '#444',
          }}>
            <span>END OF QUESTIONS</span>
            <span>Copyright © Studiq {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Score summary (after all answered) */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${gradeColor}30` }}>
            <Trophy size={28} className="mx-auto mb-3" style={{ color: gradeColor }} />
            <p className="text-3xl font-bold mb-1" style={{ color: gradeColor }}>{grade}</p>
            <p className="text-white text-lg font-semibold">{totalEarned} / {paper.totalMarks} marks</p>
            <p className="text-sm mt-1" style={{ color: '#5a7aaa' }}>{pct}% — {
              pct >= 80 ? 'Outstanding work.' :
              pct >= 70 ? 'Solid performance. A few more marks and you\'re at A*.' :
              pct >= 60 ? 'Good effort. Focus on your weak topics.' :
              'Keep practising — every attempt builds mastery.'
            }</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
