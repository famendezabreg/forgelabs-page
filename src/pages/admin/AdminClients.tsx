import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { formatDate } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import { clientLabel, useClients } from '../../lib/useClients'
import { useProjects } from '../../lib/useProjectData'

const ROLES = [
  { value: 'client', label: 'Cliente' },
  { value: 'collaborator', label: 'Colaborador' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Gerencia' },
]

export default function AdminClients() {
  const { clients, loading, error } = useClients()
  const { projects } = useProjects('all')
  const { user } = useAuth()
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const counts = new Map<string, number>()
  projects.forEach((p) => {
    if (p.client_id) counts.set(p.client_id, (counts.get(p.client_id) ?? 0) + 1)
  })

  async function changeRole(id: string, role: string) {
    if (!supabase) return
    const { error: err } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (err) return setMsg({ kind: 'error', text: 'No se pudo cambiar el rol.' })
    setRoles((r) => ({ ...r, [id]: role }))
    setMsg({ kind: 'ok', text: 'Rol actualizado.' })
  }

  return (
    <>
      <div className="app-topbar">
        <div>
          <span className="kicker">Panel administrativo</span>
          <h1>Clientes y usuarios</h1>
        </div>
      </div>
      {error && (
        <div className="form-msg error" role="alert">
          {error}
        </div>
      )}
      {msg && (
        <div className={`form-msg ${msg.kind}`} role={msg.kind === 'error' ? 'alert' : 'status'}>
          {msg.text}
        </div>
      )}
      <div className="card panel">
        {loading ? (
          <p className="empty">Cargando…</p>
        ) : clients.length === 0 ? (
          <p className="empty">Todavía no hay usuarios registrados.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo</th>
                  <th>Sector</th>
                  <th>Proyectos</th>
                  <th>Registro</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{clientLabel(c)}</b>
                      {c.full_name && c.company_name ? (
                        <>
                          <br />
                          <span className="meta" style={{ color: 'var(--dim-2)', fontSize: 12 }}>
                            {c.full_name}
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td>{c.email ?? '—'}</td>
                    <td>{c.sector ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{counts.get(c.id) ?? 0}</td>
                    <td>{formatDate(c.created_at)}</td>
                    <td>
                      <select
                        className="inline-select"
                        aria-label={`Rol de ${clientLabel(c)}`}
                        value={roles[c.id] ?? c.role}
                        disabled={c.id === user?.id}
                        onChange={(e) => void changeRole(c.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
