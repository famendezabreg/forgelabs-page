import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { About } from '../components/home/About'
import { Cases } from '../components/home/Cases'
import { ContactCta } from '../components/home/ContactCta'
import { Faq } from '../components/home/Faq'
import { Footer } from '../components/home/Footer'
import { Hero } from '../components/home/Hero'
import { Method } from '../components/home/Method'
import { Nav } from '../components/home/Nav'
import { Payment } from '../components/home/Payment'
import { Principles } from '../components/home/Principles'
import { Problems } from '../components/home/Problems'
import { ServicesAccordion } from '../components/home/ServicesAccordion'
import { Team } from '../components/home/Team'
import { useReveal } from '../hooks/useReveal'

/** La home trae su propio Nav y Footer; no usa el Layout de las demás rutas. */
export default function Home() {
  const { hash } = useLocation()
  useReveal()

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView()
  }, [hash])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <Nav />
      <main id="main-content" className="page-in">
        <Hero />
        <Problems />
        <ServicesAccordion />
        <Method />
        <Principles />
        <Payment />
        <Cases />
        <About />
        <Team />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
    </>
  )
}
