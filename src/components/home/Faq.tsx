import { FAQ, visible } from '../../content/home'
import { Accordion, type AccordionItem } from './Accordion'

export function Faq() {
  const items: AccordionItem[] = FAQ.items
    .filter((f) => visible(f.a))
    .map((f, i) => ({
      id: `faq-${i}`,
      head: f.q,
      body: <p className="faq-answer">{f.a}</p>,
    }))

  return (
    <section className="hsec hfaq" aria-labelledby="faq-title">
      <div className="hwrap hfaq-grid">
        <div className="hfaq-head reveal">
          <span className="kicker">{FAQ.kicker}</span>
          <h2 id="faq-title">{FAQ.title}</h2>
        </div>
        <Accordion items={items} variant="faq" initial={-1} />
      </div>
    </section>
  )
}
