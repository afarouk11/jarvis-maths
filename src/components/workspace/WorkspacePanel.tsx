'use client'

import { motion } from 'framer-motion'
import { BookOpen, PencilLine } from 'lucide-react'
import { NotesPanel } from './NotesPanel'
import { PracticePanel } from './PracticePanel'

export interface WorkspaceState {
  page: 'notes' | 'practice'
  topicSlug: string
  topicName: string
  /** Practice only: BKT-sized question count. */
  total?: number
}

interface Props {
  workspace: WorkspaceState
  onClose: () => void
  /** Called when the student finishes the work — closes the panel and checks in with SPOK. */
  onDone: (page: 'notes' | 'practice', summary?: { answered: number; correct: number }) => void
}

/**
 * SPOK's workspace — notes and practice rendered inside the SPOK page itself,
 * sliding over the brain canvas. The student never leaves the conversation.
 */
export function WorkspacePanel({ workspace, onClose, onDone }: Props) {
  const isNotes = workspace.page === 'notes'

  return (
    <motion.div
      key={`workspace-${workspace.page}-${workspace.topicSlug}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 flex flex-col px-5 py-4"
      style={{ background: 'rgba(8,13,25,0.94)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isNotes
            ? <BookOpen size={13} style={{ color: '#818cf8' }} />
            : <PencilLine size={13} style={{ color: '#818cf8' }} />}
          <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: '#818cf8' }}>
            SPOK · {isNotes ? 'Notes' : 'Practice'}
            <span className="opacity-60 normal-case tracking-normal font-normal"> — {workspace.topicName}</span>
          </p>
        </div>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded-lg shrink-0"
          style={{ color: 'rgba(129,140,248,0.5)', border: '1px solid rgba(99,102,241,0.18)' }}>
          ✕ minimise
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isNotes ? (
          <NotesPanel
            topicSlug={workspace.topicSlug}
            topicName={workspace.topicName}
            onDone={() => onDone('notes')}
          />
        ) : (
          <PracticePanel
            topicSlug={workspace.topicSlug}
            topicName={workspace.topicName}
            total={workspace.total ?? 5}
            onDone={summary => onDone('practice', summary)}
          />
        )}
      </div>
    </motion.div>
  )
}
