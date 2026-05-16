'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'

const FLOATS = [
  { symbol: '∫',    top: '12%', left: '8%',  size: 48, delay: 0 },
  { symbol: 'dx',   top: '20%', left: '88%', size: 22, delay: 0.4 },
  { symbol: 'lim',  top: '65%', left: '5%',  size: 20, delay: 0.8 },
  { symbol: '∑',    top: '75%', left: '90%', size: 44, delay: 0.2 },
  { symbol: 'θ',    top: '40%', left: '92%', size: 30, delay: 1.0 },
  { symbol: '√',    top: '82%', left: '18%', size: 36, delay: 0.6 },
  { symbol: 'π',    top: '10%', left: '55%', size: 28, delay: 1.2 },
  { symbol: '∞',    top: '88%', left: '60%', size: 32, delay: 0.3 },
]

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="notebook-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Floating math symbols */}
      {FLOATS.map(({ symbol, top, left, size, delay }) => (
        <motion.span
          key={symbol + top}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.07, 0.04, 0.07, 0] }}
          transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top, left,
            fontSize: size, color: '#3b82f6',
            fontFamily: 'var(--font-geist-mono)',
            pointerEvents: 'none', userSelect: 'none',
          }}
        >
          {symbol}
        </motion.span>
      ))}

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative"
        style={{ maxWidth: 480 }}
      >
        {/* 404 number */}
        <div className="relative inline-block mb-6">
          <motion.h1
            animate={{ textShadow: [
              '0 0 40px rgba(59,130,246,0.3)',
              '0 0 80px rgba(99,102,241,0.4)',
              '0 0 40px rgba(59,130,246,0.3)',
            ]}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: 'clamp(96px, 20vw, 160px)',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </motion.h1>
        </div>

        {/* Equation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6"
          style={{
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.15)',
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 13,
            color: '#4a7aaa',
          }}
        >
          <span style={{ color: '#60a5fa' }}>page</span>
          <span>∉</span>
          <span style={{ color: '#60a5fa' }}>studiq.org</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 22, letterSpacing: '-0.02em' }}
        >
          SPOK couldn't find this page.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-10"
          style={{ color: '#5a7aaa', lineHeight: 1.7 }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                boxShadow: '0 0 24px rgba(59,130,246,0.3)',
              }}
            >
              <Home size={15} />
              Go to Dashboard
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#5a7aaa',
            }}
          >
            <ArrowLeft size={15} />
            Go back
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-xs"
        style={{ color: '#2d3a4a', fontFamily: 'var(--font-geist-mono)' }}
      >
        studiq.org
      </motion.p>
    </div>
  )
}
