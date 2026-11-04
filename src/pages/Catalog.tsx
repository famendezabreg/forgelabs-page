import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_FILTERS, type ServiceCategory } from '../data/services'
import { useServices } from '../lib/useServices'

export default function Catalog() {
  const [filter, setFilter] = useState<'all' | ServiceCategory>('all')
  const { services, loading } = useServices()
  const visible = services.filter((s) => filter === 'all' || s.category === filter)

  return (
    <div className="container section">
      <div className="section-head">
        <span className="kicker">Catálogo de servicios</span>
        <h2>Elige el punto de partida</h2>
        <p>Precios claros desde el inicio, para MIPYMEs que no tienen equipo técnico interno.</p>
        <p className="ai-note">
          <span className="pill on">
            <span className="dot-live" />
            IA CON REVISIÓN HUMANA
          </span>
          En todo lo que lleva IA, una persona revisa antes de que algo llegue a tus clientes.
        </p>
      </div>
      <div className="filter-row" role="group" aria-label="Filtrar por categoría">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="catalog-grid" aria-busy={loading}>
        {visible.map((s) => (
          <article className="card svc-card" key={s.slug}>
            <div className="svc-top">
              <div className="svc-icon" aria-hidden="true">
                ◆
              </div>
              <span className={`pill${s.badge_tone === 'on' ? ' on' : ''}`}>{s.badge}</span>
            </div>
            <h3>{s.name}</h3>
            <p className="desc">{s.description}</p>
            <ul className="svc-list">
              {s.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <span className="svc-price">{s.price_note}</span>
            <Link to={`/cotizar?servicio=${s.slug}`} className="btn btn-ghost btn-sm svc-cta">
              Solicitar cotización
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
