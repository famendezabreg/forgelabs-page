import { useEffect, useState } from 'react'

/** Escenario base del plan de negocio, mes 12. Son proyecciones, no datos reales. */
const SCENARIO = 'Escenario base · mes 12'

const MONTHLY_REVENUE = [805, 839, 871, 1707, 1770, 1831, 1889, 2750, 2837, 2921, 3001, 3078]

const KPIS = [
  { label: 'Clientes con mensualidad', value: 16, prefix: '', suffix: '', hint: 'Al cierre del mes 12' },
  { label: 'CAC', value: 133, prefix: '$', suffix: '', hint: 'Costo de adquirir un cliente' },
  { label: 'LTV', value: 1030, prefix: '$', suffix: '', hint: 'Valor de vida del cliente' },
  { label: 'Ingresos del año 1', value: 24300, prefix: '$', suffix: '', hint: 'Suma de los 12 meses' },
]

const SECONDARY = [
  { label: 'LTV / CAC', value: '7.8x' },
  { label: 'Clientes nuevos en el año', value: '26' },
  { label: 'Punto de equilibrio', value: 'Mes 4' },
]

function useCountUp(target: number) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = requestAnimationFrame(() => setValue(target))
      return () => cancelAnimationFrame(id)
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1000, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return value
}

function Kpi({ value, prefix, suffix, label, hint, star = false }: { value: number; prefix: string; suffix: string; label: string; hint: string; star?: boolean }) {
  const v = useCountUp(value)
  return (
    <div className={`card kpi-card${star ? ' kpi-star' : ''}`}>
      <div className="kv">
        {prefix}
        {v.toLocaleString('en-US')}
        {suffix}
      </div>
      <div className="kl">{label}</div>
      <div className="kd">{hint}</div>
    </div>
  )
}

function RevenueChart() {
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60)
    return () => clearTimeout(t)
  }, [])
  const max = Math.max(...MONTHLY_REVENUE)

  return (
    <div className="card chart-card">
      <h2 className="chart-title">Ingresos mensuales proyectados (USD) · meses 1 a 12</h2>
      <div className="bars bars-12" role="img" aria-label={MONTHLY_REVENUE.map((v, i) => `Mes ${i + 1}: $${v}`).join(', ')}>
        {MONTHLY_REVENUE.map((v, i) => (
          <div
            key={i}
            className={`bar${i === MONTHLY_REVENUE.length - 1 ? ' current' : ''}`}
            style={{ height: grown ? `${(v / max) * 100}%` : '0%' }}
            title={`Mes ${i + 1}: $${v.toLocaleString('en-US')}`}
          >
            <em>${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}</em>
            <span>M{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <>
      <div className="app-topbar">
        <div>
          <span className="kicker">Dashboard gerencial</span>
          <h1>Plan de negocio · año 1</h1>
        </div>
        <span className="pill warn">PROYECCIÓN · {SCENARIO}</span>
      </div>

      <p className="proj-note" role="note">
        Estas cifras son las proyecciones del plan de negocio (escenario base, mes 12). No son resultados reales: no se calculan con los datos de la base.
      </p>

      <div className="kpi-hero">
        <Kpi value={738} prefix="$" suffix="" label="Ingreso mensual recurrente" hint="Métrica estrella · mes 12" star />
        <div className="kpi-grid kpi-grid-3">
          {KPIS.map((k) => (
            <Kpi key={k.label} {...k} />
          ))}
        </div>
      </div>

      <div className="secondary-row">
        {SECONDARY.map((s) => (
          <div className="card secondary-card" key={s.label}>
            <span className="kl">{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>

      <RevenueChart />
    </>
  )
}
