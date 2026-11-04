import { useMemo } from 'react'
import { ABOUT } from '../../content/home'

interface Country {
  code: string
  /** lon, lat aproximados del centro */
  lon: number
  lat: number
  r: number
  tone: 'forge' | 'signal' | 'dim'
}

const COUNTRIES: Country[] = [
  { code: 'GT', lon: -90.5, lat: 15.4, r: 1.55, tone: 'signal' },
  { code: 'BZ', lon: -88.7, lat: 17.1, r: 0.7, tone: 'dim' },
  { code: 'SV', lon: -88.9, lat: 13.7, r: 0.75, tone: 'forge' },
  { code: 'HN', lon: -86.6, lat: 14.9, r: 1.45, tone: 'dim' },
  { code: 'NI', lon: -85.2, lat: 12.8, r: 1.55, tone: 'dim' },
  { code: 'CR', lon: -84.2, lat: 9.9, r: 1.05, tone: 'dim' },
  { code: 'PA', lon: -80.3, lat: 8.7, r: 1.45, tone: 'dim' },
]

const W = 560
const H = 300
const STEP = 9

/** Mapa abstracto: una malla de puntos asignada al país más cercano dentro de su radio. */
function useDots() {
  return useMemo(() => {
    const lonMin = -92.5
    const lonMax = -77.5
    const latMin = 7.5
    const latMax = 18
    const sx = (W - 40) / (lonMax - lonMin)
    const sy = (H - 40) / (latMax - latMin)
    const toX = (lon: number) => 20 + (lon - lonMin) * sx
    const toY = (lat: number) => 20 + (latMax - lat) * sy

    const dots: { x: number; y: number; tone: Country['tone']; code: string }[] = []
    for (let y = 20; y <= H - 20; y += STEP) {
      for (let x = 20; x <= W - 20; x += STEP) {
        let best: Country | null = null
        let bestD = Infinity
        for (const c of COUNTRIES) {
          const dx = (x - toX(c.lon)) / sx
          const dy = (y - toY(c.lat)) / sy
          const d = Math.hypot(dx, dy) / c.r
          if (d < 1 && d < bestD) {
            best = c
            bestD = d
          }
        }
        if (best) dots.push({ x, y, tone: best.tone, code: best.code })
      }
    }
    const labels = COUNTRIES.filter((c) => ['SV', 'GT'].includes(c.code)).map((c) => ({ code: c.code, x: toX(c.lon), y: toY(c.lat), tone: c.tone }))
    return { dots, labels }
  }, [])
}

export function About() {
  const { dots, labels } = useDots()
  const sv = labels.find((l) => l.code === 'SV')
  const gt = labels.find((l) => l.code === 'GT')

  return (
    <section className="hsec habout" id="nosotros" aria-labelledby="about-title">
      <div className="hwrap">
        <div className="habout-grid">
          <div className="habout-copy">
            <div className="reveal">
              <span className="kicker">{ABOUT.kicker}</span>
              <h2 id="about-title">{ABOUT.title}</h2>
            </div>
            <div className="habout-mv">
              <div className="reveal" style={{ ['--i' as string]: 1 }}>
                <span className="mono-label">{ABOUT.mission.label}</span>
                <p>{ABOUT.mission.text}</p>
              </div>
              <div className="reveal" style={{ ['--i' as string]: 2 }}>
                <span className="mono-label">{ABOUT.vision.label}</span>
                <p>{ABOUT.vision.text}</p>
                <span className="habout-route">{ABOUT.vision.route}</span>
              </div>
            </div>
          </div>

          <figure className="habout-map reveal" style={{ ['--i' as string]: 2 }}>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa de Centroamérica: El Salvador y Guatemala destacados">
              {dots.map((d) => (
                <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={d.tone === 'dim' ? 1.8 : 2.6} className={`map-dot ${d.tone}`} />
              ))}
              {sv && (
                <g className="map-pulse forge">
                  <circle cx={sv.x} cy={sv.y} r="5" />
                  <circle cx={sv.x} cy={sv.y} r="5" className="ring" />
                </g>
              )}
              {gt && (
                <g className="map-pulse signal">
                  <circle cx={gt.x} cy={gt.y} r="4" />
                </g>
              )}
              {sv && (
                <text x={sv.x - 14} y={sv.y + 26} className="map-label forge" textAnchor="end">
                  SV
                </text>
              )}
              {gt && (
                <text x={gt.x - 20} y={gt.y - 14} className="map-label signal" textAnchor="end">
                  GT
                </text>
              )}
            </svg>
            <figcaption>13.7°N 89.2°W · SV//ORIGEN</figcaption>
          </figure>
        </div>

        <ol className="hvalues">
          {ABOUT.values.map((v, i) => (
            <li key={v.title} className="reveal" style={{ ['--i' as string]: i }}>
              <span className="hv-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
