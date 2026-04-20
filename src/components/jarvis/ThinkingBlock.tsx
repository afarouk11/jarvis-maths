'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Brain } from 'lucide-react'

interface Props {
  thinking: string
  isStreaming?: boolean
}

export function ThinkingBlock({ thinking, isStreaming = false }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-3 rounded-lg overflow-hidden"
      style={{ border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.04)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-blue-500/5 transition-colors">
        <motion.div
          animate={isStreaming ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Brain size={14} className="text-blue-400" />
        </motion.div>
        <span className="text-xs text-blue-400 font-medium flex-1">
          {isStreaming ? 'Jarvis is reasoning...' : 'View reasoning'}
        </span>
        {!isStreaming && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-blue-400/60" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {(open || isStreaming) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <div className="px-3 pb-3 pt-1 max-h-48 overflow-y-auto">
              <p className="text-xs leading-relaxed whitespace-pre-wrap"
                style={{ color: '#5a7aaa', fontFamily: 'var(--font-mono)' }}>
                {thinking}
                {isStreaming && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity }}>
                    ▋
                  </motion.span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
