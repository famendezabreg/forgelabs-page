import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { METHOD } from '../../content/home'

const STEP_MS = 6000

export function Method() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [hover, setHover] = useState(false)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const total = METHOD.stages.length

  useEffect(() => {
    const el = sectionRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!auto || hover || !inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setActive((a) => (a + 1) % total), STEP_MS)
    return () => window.clearInterval(id)
  }, [auto, hover, inView, total])

  const select = (i: number) => {
    setActive(i)
    setAuto(false)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % total
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + total) % total
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = total - 1
    else return
    e.preventDefault()
    select(next)
    btns.current[next]?.focus()
  }

  const stage = METHOD.stages[active]
  const details = [stage.what, stage.get, stage.portal]
  const progress = total > 1 ? (active / (total - 1)) * 100 : 0

  return (
    <section ref={sectionRef} className="hsec hmethod" id="metodo" aria-labelledby="method-title">
      <div className="hwrap">
        <div className="hmethod-head reveal">
          <span className="kicker">{METHOD.kicker}</span>
          <h2 id="method-title">{METHOD.title}</h2>
        </div>

        <div
          className="hmethod-body"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
        >
          <div className="mt-track" role="tablist" aria-label="Etapas del método" aria-orientation="horizontal">
            <div className="mt-line" aria-hidden="true">
              <div className="mt-line-fill" style={{ ['--p' as string]: `${progress}%` }} />
            </div>
            {METHOD.stages.map((s, i) => (
              <button
                key={s.name}
                ref={(el) => {
                  btns.current[i] = el
                }}
                type="button"
                role="tab"
                id={`mt-tab-${i}`}
                aria-selected={i === active}
                aria-controls="mt-panel"
                tabIndex={i === active ? 0 : -1}
                className={`mt-stage${i === active ? ' active' : ''}${i < active ? ' passed' : ''}`}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="mt-node" aria-hidden="true" />
                <span className="mt-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-name">{s.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-panel" id="mt-panel" role="tabpanel" aria-labelledby={`mt-tab-${active}`} key={active}>
            {METHOD.labels.map((label, i) => (
              <div className="mt-col" key={label}>
                <span className="mt-col-label">{label}</span>
                <p>{details[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
