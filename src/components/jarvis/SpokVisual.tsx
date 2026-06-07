'use client'

import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import type { JarvisState, StudentProgress, Topic } from '@/types'

// Both scenes touch window/document — load client-only, same pattern as the
// rest of the app's Three.js mounts.
const JarvisScene = dynamic(
  () => import('./JarvisScene').then(m => ({ default: m.JarvisScene })),
  { ssr: false },
)
const BrainScene = dynamic(() => import('@/components/progress/BrainScene'), { ssr: false })

export interface BrainData {
  progress: StudentProgress[]
  topics: Omit<Topic, 'id' | 'parent_id'>[]
  topicCategories: Record<string, string[]>
  focusSlug: string | null
  onNodeClick?: (slug: string) => void
  onHover?: (info: { name: string; slug: string; pKnown: number } | null) => void
}

interface Props {
  mode: 'avatar' | 'brain'
  state: JarvisState
  amplitude: number
  brain: BrainData
}

const SWAP = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.6, ease: 'easeInOut' as const },
}

/**
 * The single SPOK visual slot. Crossfades between the avatar and the student's
 * 3D brain in the same container, both ways, with a neural-burst flash on swap.
 */
export function SpokVisual({ mode, state, amplitude, brain }: Props) {
  const noop = () => {}
  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === 'brain' ? (
          <motion.div key="brain" className="absolute inset-0" {...SWAP}>
            <BrainScene
              progress={brain.progress}
              topics={brain.topics}
              topicCategories={brain.topicCategories}
              sectionFilter={null}
              focusSlug={brain.focusSlug}
              fill
              onHover={brain.onHover ?? noop}
              onClick={brain.onNodeClick ?? noop}
            />
          </motion.div>
        ) : (
          <motion.div key="avatar" className="absolute inset-0" {...SWAP}>
            <JarvisScene amplitude={amplitude} state={state} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neural-burst flash, keyed on mode so it fires on each swap. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ background: 'radial-gradient(circle at center, rgba(245,158,11,0.28), transparent 62%)' }}
        />
      </AnimatePresence>
    </div>
  )
}
