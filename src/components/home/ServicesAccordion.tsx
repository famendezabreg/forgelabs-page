import { Link } from 'react-router-dom'
import { SERVICES } from '../../content/home'
import { useServices } from '../../lib/useServices'
import { Accordion, type AccordionItem } from './Accordion'

export function ServicesAccordion() {
  const { services } = useServices()

  const items: AccordionItem[] = services.map((s) => ({
    id: s.slug,
    head: s.name,
    meta: <span className="chip">{SERVICES.categoryLabel[s.category] ?? s.category.toUpperCase()}</span>,
    body: (
      <div className="svc-open">
        <div className="svc-open-main">
          <p className="svc-open-desc">{s.description}</p>
          <p className="svc-aporta">
            <span>{SERVICES.aportaLabel}</span>
            {SERVICES.aporta[s.slug] ?? SERVICES.aportaFallback}
          </p>
        </div>
        <div className="svc-open-side">
          <ul className="svc-feat">
            {s.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <span className="svc-price-note">{s.price_note}</span>
          <Link to={`/cotizar?servicio=${s.slug}`} className="svc-link">
            {SERVICES.cta}
          </Link>
        </div>
      </div>
    ),
  }))

  return (
    <section className="hsec hservices" id="servicios" aria-labelledby="services-title">
      <div className="hwrap">
        <div className="hservices-head reveal">
          <span className="kicker">{SERVICES.kicker}</span>
          <h2 id="services-title">{SERVICES.title}</h2>
          <p>{SERVICES.intro}</p>
        </div>
        <Accordion key={items.map((i) => i.id).join()} items={items} variant="service" initial={0} />
      </div>
    </section>
  )
}
