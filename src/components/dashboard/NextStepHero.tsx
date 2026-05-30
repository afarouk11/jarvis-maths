import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export interface NextStep {
  /** Plain-language headline — the one thing to do now. */
  readonly title: string
  /** One supporting sentence. */
  readonly subtitle: string
  /** Where the primary button goes. */
  readonly href: string
  /** Button label. */
  readonly cta: string
  /** Emoji shown in the hero badge. */
  readonly emoji: string
}

/**
 * The dashboard's single most important element: answers "what do I do next?"
 * with one headline and one big button. Everything else on the page is secondary.
 */
export function NextStepHero({ step }: { step: NextStep }): React.ReactElement {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.07) 100%)',
        border: '1px solid rgba(59,130,246,0.28)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="flex items-center justify-center text-2xl rounded-2xl shrink-0"
          style={{ width: 56, height: 56, background: 'rgba(59,130,246,0.15)' }}
          aria-hidden
        >
          {step.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#7ab3ff' }}>
            Your next step
          </p>
          <h2
            className="font-bold text-white mt-0.5"
            style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 20, letterSpacing: '-0.01em' }}
          >
            {step.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#9fb6d9' }}>{step.subtitle}</p>
        </div>

        <Link
          href={step.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 font-semibold text-white shrink-0 transition-transform hover:scale-[1.02]"
          style={{ background: '#3b82f6', minHeight: 48 }}
        >
          {step.cta}
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
