'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

interface Props {
  listening: boolean
  speaking: boolean
  voiceEnabled: boolean
  onMicClick: () => void
  onToggleVoice: () => void
}

export function JarvisVoice({ listening, speaking, voiceEnabled, onMicClick, onToggleVoice }: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* Voice output toggle */}
      <button
        onClick={onToggleVoice}
        title={voiceEnabled ? 'Mute Spok' : 'Unmute Spok'}
        className="p-1.5 rounded-lg transition-colors"
        style={{ color: voiceEnabled ? '#3b82f6' : '#374151' }}>
        {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>

      {/* Mic button */}
      <motion.button
        onClick={onMicClick}
        whileTap={{ scale: 0.93 }}
        className="relative p-2 rounded-xl transition-all"
        style={{
          background: listening ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.08)',
          border: `1px solid ${listening ? 'rgba(34,197,94,0.4)' : 'rgba(59,130,246,0.15)'}`,
          color: listening ? '#22c55e' : '#3b82f6',
        }}>
        {/* Listening pulse rings */}
        <AnimatePresence>
          {listening && (
            <>
              {[0, 1].map(i => (
                <motion.span key={i}
                  className="absolute inset-0 rounded-xl border border-green-400"
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {listening ? <MicOff size={14} /> : <Mic size={14} />}
      </motion.button>

      {/* Waveform bars while listening */}
      <AnimatePresence>
        {listening && (
          <div key="listening-bars" className="flex items-center gap-0.5">
            {[1, 0.7, 1, 0.5, 0.8].map((h, i) => (
              <motion.div key={`l-${i}`}
                className="w-0.5 rounded-full bg-green-400"
                animate={{ scaleY: [h, h * 0.3, h] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                style={{ height: 12 }}
              />
            ))}
          </div>
        )}
        {speaking && voiceEnabled && (
          <div key="speaking-bars" className="flex items-center gap-0.5">
            {[0.6, 1, 0.8, 1, 0.6].map((h, i) => (
              <motion.div key={`s-${i}`}
                className="w-0.5 rounded-full bg-blue-400"
                animate={{ scaleY: [h, h * 0.2, h] }}
                transition={{ duration: 0.5, delay: i * 0.08, repeat: Infinity }}
                style={{ height: 12 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
