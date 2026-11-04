import { useRef, useState, type KeyboardEvent } from 'react'
import { CASES } from '../../content/home'

export function Cases() {
  const [active, setActive] = useState(0)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const total = CASES.items.length
  const item = CASES.items[active]

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % total
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + total) % total
    else return
    e.preventDefault()
    setActive(next)
    btns.current[next]?.focus()
  }

  return (
    <section className="hsec hcases" id="casos" aria-labelledby="cases-title">
      <div className="hwrap">
        <div className="hcases-head reveal">
          <span className="kicker">{CASES.kicker}</span>
          <h2 id="cases-title">{CASES.title}</h2>
        </div>

        <div className="hcases-body">
          <div className="hc-index" role="tablist" aria-label="Casos" aria-orientation="vertical">
            {CASES.items.map((c, i) => (
              <button
                key={c.name}
                ref={(el) => {
                  btns.current[i] = el
                }}
                type="button"
                role="tab"
                id={`case-tab-${i}`}
                aria-selected={i === active}
                aria-controls="case-panel"
                tabIndex={i === active ? 0 : -1}
                className={`hc-item reveal${i === active ? ' active' : ''}`}
                style={{ ['--i' as string]: i }}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="hc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="hc-name">{c.name}</span>
                <span className="hc-sector">{c.tag}</span>
              </button>
            ))}
          </div>

          <article className="card hc-panel" id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${active}`} key={active}>
            <span className="hc-metric-label">{CASES.statusLabel}</span>
            <div className="hc-metric">
              <span className="hc-status">{item.status}</span>
            </div>
            <span className="hc-sector-line">{item.sector}</span>
            <p>{item.body}</p>
            <div className="case-stack">
              {item.chips.map((c) => (
                <span className="chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
