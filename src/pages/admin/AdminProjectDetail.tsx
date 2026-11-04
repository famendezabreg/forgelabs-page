import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatBytes, formatDate, formatMoney, safeFileName } from '../../lib/format'
import { supabase } from '../../lib/supabase'
import {
  MILESTONE_LABEL,
  STATUS_LABEL,
  type MilestoneStatus,
  type Project,
  type ProjectStatus,
} from '../../lib/types'
import { TEAM_OWNERS } from '../../data/team'
import { clientLabel, useClients } from '../../lib/useClients'
import { openDocument, useProjectBundle } from '../../lib/useProjectData'

const MAX_UPLOAD = 20 * 1024 * 1024

export default function AdminProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients } = useClients()
  const bundle = useProjectBundle(id)

  const [project, setProject] = useState<Project | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [form, setForm] = useState({ name: '', status: 'discovery' as ProjectStatus, progress: 0, date: '', note: '', fee: '', owner: '' })
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const [updateText, setUpdateText] = useState('')
  const [ms, setMs] = useState({ title: '', due: '', amount: '' })
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!supabase || !id) return
    let active = true
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        if (!data) return setState('missing')
        const p = data as Project
        setProject(p)
        setForm({
          name: p.name,
          status: p.status,
          progress: p.progress,
          date: p.next_delivery_date ?? '',
          note: p.next_delivery_note ?? '',
          fee: p.monthly_fee_usd?.toString() ?? '',
          owner: p.owner ?? '',
        })
        setState('ready')
      })
    return () => {
      active = false
    }
  }, [id])

  const flash = (kind: 'ok' | 'error', text: string) => setMsg({ kind, text })

  async function run(action: () => PromiseLike<{ error: unknown }>, okText: string, errText: string) {
    const { error } = await action()
    if (error) {
      flash('error', errText)
      return false
    }
    flash('ok', okText)
    bundle.reload()
    return true
  }

  async function saveProject(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !project) return
    if (form.name.trim().length < 2) return flash('error', 'El nombre es muy corto.')
    const fee = form.fee === '' ? null : Number(form.fee)
    if (fee !== null && (Number.isNaN(fee) || fee < 0)) return flash('error', 'La cuota mensual no es válida.')
    const progress = Math.min(100, Math.max(0, Math.round(Number(form.progress) || 0)))
    setSaving(true)
    const { error } = await supabase
      .from('projects')
      .update({
        name: form.name.trim(),
        status: form.status,
        progress,
        next_delivery_date: form.date || null,
        next_delivery_note: form.note.trim() || null,
        monthly_fee_usd: fee,
        owner: form.owner || null,
      })
      .eq('id', project.id)
    setSaving(false)
    if (error) return flash('error', 'No se pudieron guardar los cambios.')
    setForm((f) => ({ ...f, progress }))
    flash('ok', 'Cambios guardados.')
  }

  async function addUpdate(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !project) return
    const body = updateText.trim()
    if (body.length < 2) return flash('error', 'Escribe la actualización.')
    const ok = await run(
      () => supabase!.from('project_updates').insert({ project_id: project.id, body }),
      'Actualización publicada.',
      'No se pudo publicar la actualización.',
    )
    if (ok) setUpdateText('')
  }

  async function addMilestone(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !project) return
    const title = ms.title.trim()
    if (title.length < 2) return flash('error', 'Escribe el título del hito.')
    const amount = ms.amount === '' ? null : Number(ms.amount)
    if (amount !== null && (Number.isNaN(amount) || amount < 0)) return flash('error', 'El monto no es válido.')
    const ok = await run(
      () =>
        supabase!.from('milestones').insert({
          project_id: project.id,
          title,
          due_date: ms.due || null,
          amount_usd: amount,
          sort_order: bundle.milestones.length,
        }),
      'Hito agregado.',
      'No se pudo agregar el hito.',
    )
    if (ok) setMs({ title: '', due: '', amount: '' })
  }

  async function onUpload(file: File | undefined) {
    if (!supabase || !project || !file) return
    if (file.size > MAX_UPLOAD) return flash('error', 'El archivo supera los 20 MB.')
    setUploading(true)
    const path = `${project.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
    const up = await supabase.storage.from('project-docs').upload(path, file, { contentType: file.type || undefined })
    if (up.error) {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
      return flash('error', 'No se pudo subir el archivo.')
    }
    const ins = await supabase
      .from('documents')
      .insert({ project_id: project.id, name: file.name, storage_path: path, size_bytes: file.size })
    if (ins.error) {
      await supabase.storage.from('project-docs').remove([path])
      flash('error', 'El archivo se subió pero no se pudo registrar.')
    } else {
      flash('ok', 'Documento subido.')
      bundle.reload()
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function removeDocument(docId: string, path: string) {
    if (!supabase || !window.confirm('¿Eliminar este documento?')) return
    const rm = await supabase.storage.from('project-docs').remove([path])
    if (rm.error) return flash('error', 'No se pudo eliminar el archivo.')
    await run(() => supabase!.from('documents').delete().eq('id', docId), 'Documento eliminado.', 'No se pudo eliminar el registro.')
  }

  async function deleteProject() {
    if (!supabase || !project) return
    if (!window.confirm(`¿Eliminar el proyecto "${project.name}" y todo su contenido? Esta acción no se puede deshacer.`)) return
    const paths = bundle.documents.map((d) => d.storage_path)
    if (paths.length) await supabase.storage.from('project-docs').remove(paths)
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) return flash('error', 'No se pudo eliminar el proyecto.')
    navigate('/admin')
  }

  if (state === 'loading') return <p className="empty" role="status">Cargando…</p>
  if (state === 'missing' || !project)
    return (
      <div className="card panel" style={{ maxWidth: 520 }}>
        <h3>Proyecto no encontrado</h3>
        <Link to="/admin" className="btn btn-ghost btn-sm">
          Volver a proyectos
        </Link>
      </div>
    )

  const client = project.client_id ? clients.find((c) => c.id === project.client_id) : undefined
  const clientText = project.client_id ? clientLabel(client) : (project.client_name ?? '—')

  return (
    <>
      <div className="app-topbar">
        <div>
          <Link to="/admin" className="back-link">
            ← Proyectos
          </Link>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--dim)', fontSize: 13, marginTop: 4 }}>
            Cliente: {clientText}
            {client?.email ? ` · ${client.email}` : ''}
            {!project.client_id ? ' · sin cuenta en el portal' : ''}
          </p>
        </div>
        <div className="row-actions">
          <Link to={`/portal?proyecto=${project.id}`} className="btn btn-signal btn-sm">
            Ver como cliente
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void deleteProject()}>
            Eliminar proyecto
          </button>
        </div>
      </div>

      {msg && (
        <div className={`form-msg ${msg.kind}`} role={msg.kind === 'error' ? 'alert' : 'status'}>
          {msg.text}
        </div>
      )}
      {bundle.error && (
        <div className="form-msg error" role="alert">
          {bundle.error}
        </div>
      )}

      <form className="card panel" onSubmit={saveProject} noValidate>
        <h3>Datos del proyecto</h3>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="pName">Nombre</label>
            <input id="pName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={160} />
          </div>
          <div className="field">
            <label htmlFor="pStatus">Estado</label>
            <select id="pStatus" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
              {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pProgress">Avance ({form.progress}%)</label>
            <input
              id="pProgress"
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="pDate">Próxima entrega</label>
            <input id="pDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pNote">Qué se entrega</label>
            <input id="pNote" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={240} />
          </div>
          <div className="field">
            <label htmlFor="pOwner">Responsable</label>
            <select id="pOwner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
              <option value="">Sin asignar</option>
              {TEAM_OWNERS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} · {t.role}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pFee">Mensualidad USD (hosting, soporte y cambios menores)</label>
            <input id="pFee" type="number" min="0" step="0.01" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-forge btn-sm" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <div className="two-col">
        <div className="stack">
          <div className="card panel">
            <h3>Actividad</h3>
            <form onSubmit={addUpdate}>
              <div className="field">
                <label htmlFor="uText">Nueva actualización (la ve el cliente)</label>
                <textarea id="uText" rows={2} value={updateText} onChange={(e) => setUpdateText(e.target.value)} maxLength={1000} />
              </div>
              <button type="submit" className="btn btn-signal btn-sm">
                Publicar
              </button>
            </form>
            <div className="timeline" style={{ marginTop: 18 }}>
              {bundle.updates.length === 0 && <p className="empty">Sin actividad todavía.</p>}
              {bundle.updates.map((u) => (
                <div className="tl-item" key={u.id}>
                  <div className="tl-dot" aria-hidden="true" />
                  <div className="tl-date">{formatDate(u.created_at)}</div>
                  <p>{u.body}</p>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Eliminar actualización"
                    onClick={() =>
                      void run(() => supabase!.from('project_updates').delete().eq('id', u.id), 'Actualización eliminada.', 'No se pudo eliminar.')
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card panel">
            <h3>Hitos y facturación</h3>
            {bundle.milestones.length === 0 && <p className="empty">Sin hitos todavía.</p>}
            {bundle.milestones.map((m) => (
              <div className="doc-row" key={m.id} style={{ flexWrap: 'wrap' }}>
                <span className="doc-name">
                  {m.title}
                  <br />
                  <span className="meta">
                    {m.due_date ? formatDate(m.due_date) : 'Sin fecha'} · {formatMoney(m.amount_usd)}
                  </span>
                </span>
                <span className="row-actions">
                  <select
                    className="inline-select"
                    aria-label={`Estado del hito ${m.title}`}
                    value={m.status}
                    onChange={(e) =>
                      void run(
                        () => supabase!.from('milestones').update({ status: e.target.value as MilestoneStatus }).eq('id', m.id),
                        'Hito actualizado.',
                        'No se pudo actualizar el hito.',
                      )
                    }
                  >
                    {(Object.keys(MILESTONE_LABEL) as MilestoneStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {MILESTONE_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  {m.amount_usd != null && (
                    <label className="check-inline">
                      <input
                        type="checkbox"
                        checked={m.paid}
                        onChange={(e) =>
                          void run(
                            () => supabase!.from('milestones').update({ paid: e.target.checked }).eq('id', m.id),
                            'Pago actualizado.',
                            'No se pudo actualizar el pago.',
                          )
                        }
                      />
                      Pagado
                    </label>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label={`Eliminar hito ${m.title}`}
                    onClick={() => {
                      if (window.confirm('¿Eliminar este hito?'))
                        void run(() => supabase!.from('milestones').delete().eq('id', m.id), 'Hito eliminado.', 'No se pudo eliminar.')
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
            <form className="add-row" onSubmit={addMilestone} noValidate>
              <div className="field">
                <label htmlFor="mTitle">Nuevo hito</label>
                <input id="mTitle" value={ms.title} onChange={(e) => setMs({ ...ms, title: e.target.value })} maxLength={160} />
              </div>
              <div className="field">
                <label htmlFor="mDue">Fecha</label>
                <input id="mDue" type="date" value={ms.due} onChange={(e) => setMs({ ...ms, due: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="mAmount">Monto USD</label>
                <input id="mAmount" type="number" min="0" step="0.01" value={ms.amount} onChange={(e) => setMs({ ...ms, amount: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-signal btn-sm">
                Agregar
              </button>
            </form>
          </div>
        </div>

        <div className="card panel">
          <h3>Documentos</h3>
          {bundle.documents.length === 0 && <p className="empty">Sin documentos.</p>}
          {bundle.documents.map((d) => (
            <div className="doc-row" key={d.id}>
              <span className="doc-name">
                {d.name}
                <br />
                <span className="meta">
                  {formatDate(d.created_at)}
                  {d.size_bytes ? ` · ${formatBytes(d.size_bytes)}` : ''}
                </span>
              </span>
              <span className="row-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void openDocument(d).then((e) => e && flash('error', e))}
                >
                  Ver
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Eliminar ${d.name}`}
                  onClick={() => void removeDocument(d.id, d.storage_path)}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="docFile">Subir documento (máx. 20 MB)</label>
            <input id="docFile" ref={fileRef} type="file" disabled={uploading} onChange={(e) => void onUpload(e.target.files?.[0])} />
          </div>
          {uploading && <p className="empty" role="status">Subiendo…</p>}
        </div>
      </div>
    </>
  )
}
