import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  SPOK_LEVELS, CHAT_SKILL_MODES,
  getCurrentSpokLevel, getNextSpokLevel, progressToNextLevel,
} from '@/lib/spok-skills'
import { JarvisAvatar } from '@/components/jarvis/JarvisAvatar'

export default async function SpokShowcasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: progress } = await supabase
    .from('student_progress')
    .select('p_known')
    .eq('student_id', user.id)

  const avgMastery = progress?.length
    ? progress.reduce((s, p) => s + p.p_known, 0) / progress.length
    : 0

  const currentLevel = getCurrentSpokLevel(avgMastery)
  const nextLevel    = getNextSpokLevel(currentLevel)
  const pctToNext    = progressToNextLevel(avgMastery, currentLevel)

  return (
    <div className="min-h-screen pb-20" style={{ background: '#080d19', color: '#e8f0fe' }}>

      {/* Radial bg glow */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 600, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 65%)',
      }} />

      <div className="relative max-w-4xl mx-auto px-6 pt-14">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-16">
          <JarvisAvatar state="idle" size={80} />

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${currentLevel.glowColor}`, border: `1px solid ${currentLevel.borderColor}`, color: currentLevel.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentLevel.color }} />
            Level {currentLevel.level} · {currentLevel.title}
          </div>

          <h1 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 52, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}
            className="text-white mb-4">
            SPOK Skills
          </h1>
          <p className="text-base max-w-lg" style={{ color: '#5a7aaa' }}>
            Your AI tutor gains new abilities as your mastery grows.
            The more you practise, the more SPOK can do for you.
          </p>

          {/* Progress to next level */}
          {nextLevel && (
            <div className="mt-8 w-full max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: currentLevel.color }}>{currentLevel.title}</span>
                <span className="text-xs" style={{ color: '#4a6070' }}>{pctToNext}% to {nextLevel.title}</span>
              </div>
              <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pctToNext}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Skill Tree ───────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#3b82f6' }}>
            Skill Tree
          </h2>

          <div className="space-y-3">
            {SPOK_LEVELS.map((lvl, idx) => {
              const unlocked = avgMastery >= lvl.masteryThreshold
              const isCurrent = lvl.level === currentLevel.level
              return (
                <div key={lvl.level}>
                  {/* Connector line */}
                  {idx > 0 && (
                    <div className="flex justify-start pl-[27px] mb-0">
                      <div className="w-px h-3" style={{ background: unlocked ? lvl.color + '60' : 'rgba(255,255,255,0.06)' }} />
                    </div>
                  )}

                  <div
                    className="flex items-start gap-4 p-5 rounded-2xl transition-all"
                    style={{
                      background: isCurrent ? `${lvl.glowColor}` : unlocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.015)',
                      border: `1px solid ${isCurrent ? lvl.borderColor : unlocked ? lvl.color + '20' : 'rgba(255,255,255,0.05)'}`,
                      boxShadow: isCurrent ? `0 0 24px ${lvl.glowColor}` : 'none',
                      opacity: unlocked ? 1 : 0.45,
                    }}>

                    {/* Level badge */}
                    <div className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                      style={{
                        background: unlocked ? `${lvl.glowColor}` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${unlocked ? lvl.borderColor : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <span className="text-xs font-bold uppercase" style={{ color: unlocked ? lvl.color : '#2d3a4a', letterSpacing: '0.05em' }}>LV</span>
                      <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)', color: unlocked ? lvl.color : '#2d3a4a', lineHeight: 1 }}>
                        {lvl.level}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 16 }}>
                          {lvl.title}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${lvl.color}22`, border: `1px solid ${lvl.color}55`, color: lvl.color }}>
                            Current
                          </span>
                        )}
                        {!unlocked && (
                          <span className="text-xs" style={{ color: '#4a6070' }}>
                            🔒 Unlock at {Math.round(lvl.masteryThreshold * 100)}% avg mastery
                          </span>
                        )}
                      </div>

                      <p className="text-xs mb-3" style={{ color: '#4a6070' }}>{lvl.subtitle}</p>

                      {/* Perks */}
                      <div className="flex flex-wrap gap-2">
                        {lvl.perks.map(perk => (
                          <span key={perk} className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: unlocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              color: unlocked ? '#6b8cba' : '#2d3a4a',
                            }}>
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Unlocked modes */}
                    <div className="shrink-0 hidden sm:flex flex-col items-end gap-1">
                      {lvl.unlockedModes.map(modeId => {
                        const mode = CHAT_SKILL_MODES.find(m => m.id === modeId)
                        if (!mode) return null
                        return (
                          <span key={modeId} className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: unlocked ? `${mode.color}15` : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${unlocked ? mode.color + '30' : 'rgba(255,255,255,0.05)'}`,
                              color: unlocked ? mode.color : '#2d3a4a',
                            }}>
                            {mode.emoji} {mode.shortLabel}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Chat Skill Modes ─────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#3b82f6' }}>
            SPOK&apos;s Capabilities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAT_SKILL_MODES.map(mode => {
              const unlocked = currentLevel.unlockedModes.includes(mode.id)
              const unlockLevel = SPOK_LEVELS.find(l => l.level === mode.minLevel)
              return (
                <div key={mode.id}
                  className="p-5 rounded-2xl transition-all"
                  style={{
                    background: unlocked ? `${mode.glowColor}50` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${unlocked ? mode.color + '35' : 'rgba(255,255,255,0.06)'}`,
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: unlocked ? `${mode.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${unlocked ? mode.color + '30' : 'rgba(255,255,255,0.06)'}` }}>
                      {mode.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{mode.label}</p>
                      {!unlocked && unlockLevel && (
                        <p className="text-xs" style={{ color: '#4a6070' }}>Unlocks at {unlockLevel.title}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: unlocked ? '#6b8cba' : '#2d3a4a' }}>{mode.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="text-center">
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(59,130,246,0.15) 100%)', padding: 1, borderRadius: 20 }}>
            <div className="p-10 rounded-[19px]" style={{ background: 'rgba(8,13,25,0.9)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>
                Level {currentLevel.level} · {currentLevel.title}
              </p>
              <h3 className="text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 28, fontWeight: 700 }}>
                {nextLevel ? `${pctToNext}% to ${nextLevel.title}` : 'Maximum rank achieved'}
              </h3>
              <p className="text-sm mb-8" style={{ color: '#5a7aaa' }}>
                {nextLevel
                  ? `Keep practising to unlock ${nextLevel.unlockedModes.filter(m => !currentLevel.unlockedModes.includes(m)).map(m => CHAT_SKILL_MODES.find(cm => cm.id === m)?.label).join(', ')}.`
                  : 'You have unlocked every SPOK capability. Go get that A*.'}
              </p>
              <Link href="/jarvis">
                <button className="px-8 py-3.5 rounded-xl font-semibold text-white text-sm"
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #6366f1)',
                    boxShadow: '0 0 30px rgba(59,130,246,0.3)',
                  }}>
                  Open SPOK →
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
