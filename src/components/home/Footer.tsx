import { Link } from 'react-router-dom'
import { Brand } from '../Brand'
import { CONTACT, FOOTER, NAV, visible } from '../../content/home'

export function Footer() {
  const whatsapp = visible(CONTACT.whatsapp) ? CONTACT.whatsapp : null
  const email = visible(CONTACT.email) ? CONTACT.email : null

  return (
    <footer className="hfoot">
      <div className="hwrap hfoot-grid">
        <div>
          <Brand />
          <p className="hfoot-tag">{FOOTER.tagline}</p>
        </div>
        <nav aria-label="Pie de página">
          <span className="mono-label">{FOOTER.navTitle}</span>
          {NAV.links.map((l) => (
            <a key={l.id} href={`#${l.id}`}>
              {l.label}
            </a>
          ))}
          <Link to="/acceso">{NAV.login}</Link>
        </nav>
        <div>
          <span className="mono-label">{FOOTER.contactTitle}</span>
          <Link to="/cotizar">{NAV.cta}</Link>
          {whatsapp && <span className="hfoot-line">{whatsapp}</span>}
          {email && <span className="hfoot-line">{email}</span>}
        </div>
      </div>
      <div className="hwrap hfoot-legal">
        <span>{FOOTER.legal}</span>
        <span>
          <Link to="/terminos">Términos</Link> · <Link to="/privacidad">Privacidad</Link> · {FOOTER.legalNote}
        </span>
      </div>
    </footer>
  )
}
