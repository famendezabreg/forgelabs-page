import { useState } from 'react'
import { formatBytes, formatDate } from '../../lib/format'
import { openDocument } from '../../lib/useProjectData'
import { usePortal } from './portalContext'

export default function PortalDocuments() {
  const { documents, loading } = usePortal()
  const [error, setError] = useState<string | null>(null)

  async function open(i: number) {
    setError(null)
    const msg = await openDocument(documents[i])
    if (msg) setError(msg)
  }

  return (
    <div className="card panel">
      <h3>Documentos</h3>
      {error && (
        <div className="form-msg error" role="alert">
          {error}
        </div>
      )}
      {loading && documents.length === 0 ? (
        <p className="empty">Cargando…</p>
      ) : documents.length === 0 ? (
        <p className="empty">Aún no hay documentos compartidos contigo.</p>
      ) : (
        documents.map((d, i) => (
          <div className="doc-row" key={d.id}>
            <span className="doc-name">
              {d.name}
              <br />
              <span className="meta">
                {formatDate(d.created_at)}
                {d.size_bytes ? ` · ${formatBytes(d.size_bytes)}` : ''}
              </span>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void open(i)}>
              Descargar
            </button>
          </div>
        ))
      )}
    </div>
  )
}
