import { useState, type KeyboardEvent } from 'react'
import { PROBLEMS } from '../../content/home'

type Item = (typeof PROBLEMS.items)[number]

function ProblemCard({ item, index }: { item: Item; index: number }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }
  return (
    <div
      className={`card problem-card ${item.tone} reveal${open ? ' open' : ''}`}
      style={{ ['--i' as string]: index }}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={onKey}
    >
      <div className="pc-head">
        <h3>{item.title}</h3>
        <span className="pc-arrow" aria-hidden="true">
          →
        </span>
      </div>
      <p className="desc">{item.desc}</p>
      <div className="pc-detail">
        <p>{item.detail}</p>
      </div>
    </div>
  )
}

export function Problems() {
  return (
    <section className="hsec hproblems" aria-labelledby="problems-title">
      <div className="hwrap">
        <div className="hproblems-head reveal">
          <span className="kicker">{PROBLEMS.kicker}</span>
          <h2 id="problems-title">{PROBLEMS.title}</h2>
        </div>
        <div className="problem-grid">
          {PROBLEMS.items.map((p, i) => (
            <ProblemCard key={p.title} item={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
