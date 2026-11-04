import { Link } from 'react-router-dom'
import { LEGAL_CONTACT, PRIVACY, TERMS, type LegalDoc } from '../content/legal'
import { isTodo } from '../content/home'

function LegalPage({ doc }: { doc: LegalDoc }) {
  const contact = isTodo(LEGAL_CONTACT) ? 'el correo de contacto de Forge Labs' : LEGAL_CONTACT
  return (
    <div className="container section legal">
      <div className="section-head">
        <span className="kicker">Legal</span>
        <h1>{doc.title}</h1>
        <p>Última actualización: {doc.updated}</p>
      </div>
      {doc.sections.map((s) => (
        <section key={s.heading} className="legal-sec">
          <h2>{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p}>{p.replace('{{contact}}', contact)}</p>
          ))}
        </section>
      ))}
      <p className="legal-back">
        <Link to="/">← Volver al inicio</Link>
      </p>
    </div>
  )
}

export const Terms = () => <LegalPage doc={TERMS} />
export const Privacy = () => <LegalPage doc={PRIVACY} />
