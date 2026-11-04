import { useRef, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { HERO, visible } from '../../content/home'

const EMBERS = [
  { left: '8%', delay: '0s' },
  { left: '22%', delay: '1.3s' },
  { left: '41%', delay: '2.6s' },
  { left: '63%', delay: '.7s' },
  { left: '78%', delay: '2s' },
  { left: '91%', delay: '3.4s' },
]

export function Hero() {
  const crackRef = useRef<HTMLDivElement>(null)
  const boundsRef = useRef<DOMRect | null>(null)
  const frameRef = useRef<number | null>(null)
  const t = HERO.testimonial
  const showTestimonial = visible(t.quote) && visible(t.author)

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const crack = crackRef.current
    const r = boundsRef.current
    if (!crack || !r || frameRef.current !== null) return
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    frameRef.current = requestAnimationFrame(() => {
      crack.style.transform = `translate(${x * 16}px, ${y * 10}px)`
      frameRef.current = null
    })
  }

  return (
    <section
      className="hero hhero"
      id="top"
      onMouseEnter={(e) => {
        boundsRef.current = e.currentTarget.getBoundingClientRect()
      }}
      onMouseLeave={() => {
        boundsRef.current = null
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }}
      onMouseMove={onMove}
    >
      <div className="hero-crack" ref={crackRef} aria-hidden="true">
        <svg viewBox="0 0 1180 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF6A39" stopOpacity="0" />
              <stop offset="35%" stopColor="#FF6A39" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#46D9C9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#46D9C9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M -50 380 L 220 340 L 300 400 L 480 260 L 560 300 L 780 120 L 900 160 L 1230 40" stroke="url(#heroGrad)" strokeWidth="2" fill="none" opacity="0.75" />
        </svg>
      </div>
      <div className="embers" aria-hidden="true">
        {EMBERS.map((e) => (
          <span key={e.left} style={{ left: e.left, animationDelay: e.delay }} />
        ))}
      </div>

      <div className="hhero-inner">
        <div className="hhero-main">
          <span className="eyebrow">{HERO.kicker}</span>
          <h1>
            {HERO.title[0]}
            <span>{HERO.title[1]}</span>
            {HERO.title[2]}
          </h1>
          <p className="lede">{HERO.lede}</p>
          <div className="hero-ctas">
            <Link to="/cotizar" className="btn btn-forge">
              {HERO.primaryCta}
            </Link>
            <a href="#casos" className="btn btn-ghost">
              {HERO.secondaryCta} ↓
            </a>
          </div>
          <div className="readout">
            <div>
              <b>SISTEMA//</b> <span>{HERO.readout.system}</span>
            </div>
            <div>
              <b>{HERO.readout.clientsLabel}</b> <span>{HERO.readout.clients}</span>
            </div>
            <div>
              <b>EXPANSIÓN//</b> <span>{HERO.readout.expansion}</span>
            </div>
          </div>
        </div>

        {showTestimonial && (
          <aside className="htesti card" aria-label="Testimonio de cliente">
            <span className="htesti-mark" aria-hidden="true">
              “
            </span>
            <p>{t.quote}</p>
            <footer>
              <b>{t.author}</b>
              <span>{t.role}</span>
            </footer>
          </aside>
        )}
      </div>
    </section>
  )
}
