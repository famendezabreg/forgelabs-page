import { useId, useState, type ReactNode } from 'react'

export interface AccordionItem {
  id: string
  head: ReactNode
  /** Contenido a la derecha de la cabecera (chip, etc.). */
  meta?: ReactNode
  body: ReactNode
}

interface Props {
  items: AccordionItem[]
  variant?: 'service' | 'faq'
  /** Índice abierto al inicio; -1 para todos cerrados. */
  initial?: number
}

/** Acordeón de una sola fila abierta. Altura animada con grid 0fr→1fr (sin medir en JS). */
export function Accordion({ items, variant = 'service', initial = 0 }: Props) {
  const [open, setOpen] = useState<string | null>(items[initial]?.id ?? null)
  const base = useId()

  const toggle = (id: string) => {
    // El anclaje de scroll nativo conserva la posición sin medir ni desplazar la página cada frame.
    setOpen(open === id ? null : id)
  }

  return (
    <div className={`acc acc-${variant}`}>
      {items.map((it, i) => {
        const isOpen = open === it.id
        const btnId = `${base}-b-${it.id}`
        const panelId = `${base}-p-${it.id}`
        return (
          <div className={`acc-row${isOpen ? ' open' : ''} reveal`} key={it.id} style={{ ['--i' as string]: i }}>
            <h3 className="acc-h">
              <button
                type="button"
                id={btnId}
                className="acc-btn"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(it.id)}
              >
                <span className="acc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="acc-title">{it.head}</span>
                {it.meta && <span className="acc-meta">{it.meta}</span>}
                <span className="acc-sign" aria-hidden="true" />
              </button>
            </h3>
            <div className="acc-panel" id={panelId} role="region" aria-labelledby={btnId}>
              <div className="acc-panel-inner">
                <div className="acc-body">{it.body}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
