import { useEffect } from 'react'

/**
 * Marca con data-in (no con una clase) porque React reescribe `className` al re-renderizar y
 * borraría la marca, ocultando de nuevo el elemento.
 * Activa la animación de entrada en todos los `.reveal` presentes tras cada render de ruta. */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal:not([data-in])')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-in', ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px 100px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}
