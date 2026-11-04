import { TEAM, isTodo, visible } from '../../content/home'

export function Team() {
  const members = TEAM.members.filter((m) => visible(m.name))
  if (members.length === 0) return null

  return (
    <section className="hsec hteam" aria-labelledby="team-title">
      <div className="hwrap">
        <div className="hteam-head reveal">
          <span className="kicker">{TEAM.kicker}</span>
          <h2 id="team-title">{TEAM.title}</h2>
        </div>
        <div className="hteam-list">
          {members.map((m, i) => (
            <article className="hteam-card reveal" key={`${m.name}-${i}`} style={{ ['--i' as string]: i }}>
              <div className="hteam-photo">
                {isTodo(m.photo) ? (
                  <span className="hteam-ph" aria-hidden="true">
                    FOTO//
                  </span>
                ) : (
                  <img src={m.photo} alt={`Retrato de ${m.name}`} loading="lazy" width={320} height={400} />
                )}
              </div>
              <div className="hteam-info">
                <h3>{m.name}</h3>
                <span className="mono-label">{m.role}</span>
                <p>{m.bio}</p>
                {!isTodo(m.linkedin) && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="svc-link">
                    {TEAM.linkedinLabel}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
