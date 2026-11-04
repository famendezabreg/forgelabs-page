import { PRINCIPLES } from '../../content/home'

export function Principles() {
  const [big, ...rest] = PRINCIPLES.items
  return (
    <section className="hsec hprinciples" aria-labelledby="principles-title">
      <div className="hwrap">
        <div className="hprinciples-head reveal">
          <span className="kicker">{PRINCIPLES.kicker}</span>
          <h2 id="principles-title">{PRINCIPLES.title}</h2>
        </div>
        <div className="hprinciples-grid">
          <article className="card hp-big reveal">
            <span className="hp-tag">{big.tag}</span>
            <span className="hp-index" aria-hidden="true">
              01
            </span>
            <h3>{big.title}</h3>
            <p>{big.body}</p>
          </article>
          <div className="hp-stack">
            {rest.map((p, i) => (
              <article className="card hp-small reveal" key={p.title} style={{ ['--i' as string]: i + 1 }}>
                <span className="hp-tag">{p.tag}</span>
                <span className="hp-index" aria-hidden="true">
                  {String(i + 2).padStart(2, '0')}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
