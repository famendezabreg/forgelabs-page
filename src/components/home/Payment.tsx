import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAYMENT } from '../../content/home'
import { useCountUp } from '../../hooks/useCountUp'

const money = (n: number) => `$${n.toLocaleString('en-US')}`

function Line({ label, amount, stamp, suffix }: { label: string; amount: number; stamp: string; suffix: string }) {
  const [ref, value] = useCountUp<HTMLSpanElement>(amount)
  return (
    <li className="inv-line">
      <span className="inv-label">{label}</span>
      <span className="inv-dots" aria-hidden="true" />
      <span className="inv-amount" ref={ref}>
        {money(value)}
        {suffix}
      </span>
      <span className={`inv-state ${stamp === 'PAGADO' ? 'paid' : stamp === 'PENDIENTE' ? 'due' : ''}`}>{stamp}</span>
    </li>
  )
}

export function Payment() {
  const inv = PAYMENT.invoice
  const total = inv.lines.filter((l) => !l.suffix).reduce((s, l) => s + l.amount, 0)
  const ref = useRef<HTMLElement>(null)
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      const id = requestAnimationFrame(() => setPrinted(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPrinted(true)
          io.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 120px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hsec hpayment" aria-labelledby="payment-title" ref={ref}>
      <div className="hwrap hpayment-grid">
        <div className="hpayment-copy reveal">
          <span className="kicker">{PAYMENT.kicker}</span>
          <h2 id="payment-title">{PAYMENT.title}</h2>
          {PAYMENT.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <Link to="/cotizar" className="btn btn-forge">
            {PAYMENT.cta}
          </Link>
        </div>

        <div className={`ticket-wrap${printed ? ' printed' : ''}`}>
          <div className="ticket" role="img" aria-label={`Factura de ejemplo: ${inv.lines.map((l) => `${l.label} ${money(l.amount)}${l.suffix} ${l.stamp}`).join('; ')}`}>
            <div className="ticket-head">
              <span>FORGE LABS</span>
              <span>{inv.id}</span>
            </div>
            <div className="ticket-note">{inv.note}</div>
            <div className="ticket-project">{inv.project}</div>
            <ul className="inv-lines" aria-hidden="true">
              {inv.lines.map((l) => (
                <Line key={l.label} {...l} />
              ))}
            </ul>
            <div className="inv-total" aria-hidden="true">
              <span>{inv.totalLabel}</span>
              <span>{money(total)}</span>
            </div>
            <div className="ticket-stamp" aria-hidden="true">
              {inv.stamp}
            </div>
            <div className="ticket-edge" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
