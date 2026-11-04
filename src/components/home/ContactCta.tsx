import { Link } from 'react-router-dom'
import { CONTACT, isTodo, visible } from '../../content/home'

const EMBERS = [
  { left: '12%', delay: '0s' },
  { left: '33%', delay: '1.8s' },
  { left: '55%', delay: '.9s' },
  { left: '74%', delay: '2.7s' },
  { left: '90%', delay: '1.2s' },
]

export function ContactCta() {
  const whatsapp = visible(CONTACT.whatsapp) ? CONTACT.whatsapp : null
  const email = visible(CONTACT.email) ? CONTACT.email : null

  return (
    <section className="hcta" id={CONTACT.id} aria-labelledby="contact-title">
      <div className="embers" aria-hidden="true">
        {EMBERS.map((e) => (
          <span key={e.left} style={{ left: e.left, animationDelay: e.delay }} />
        ))}
      </div>
      <div className="hwrap hcta-inner">
        <h2 id="contact-title" className="reveal">
          {CONTACT.title}
        </h2>
        <div className="hcta-actions reveal" style={{ ['--i' as string]: 1 }}>
          <Link to="/cotizar" className="btn btn-forge">
            {CONTACT.cta}
          </Link>
          <div className="hcta-lines">
            {whatsapp && (
              <a href={isTodo(whatsapp) ? '#contacto' : `https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                <b>{CONTACT.whatsappLabel}</b> {whatsapp}
              </a>
            )}
            {email && (
              <a href={isTodo(email) ? '#contacto' : `mailto:${email}`}>
                <b>{CONTACT.emailLabel}</b> {email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
