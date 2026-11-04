import { formatDate, formatMoney } from '../../lib/format'
import { usePortal } from './portalContext'

export default function PortalBilling() {
  const { milestones, loading } = usePortal()
  const billable = milestones.filter((m) => m.amount_usd != null)
  const total = billable.reduce((s, m) => s + (m.amount_usd ?? 0), 0)
  const paid = billable.filter((m) => m.paid).reduce((s, m) => s + (m.amount_usd ?? 0), 0)

  return (
    <>
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          ['Total del proyecto', formatMoney(total)],
          ['Pagado', formatMoney(paid)],
          ['Pendiente', formatMoney(total - paid)],
        ].map(([label, value]) => (
          <div className="card panel" key={label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="card panel">
        <h3>Facturación por fases y mensualidades</h3>
        {loading && billable.length === 0 ? (
          <p className="empty">Cargando…</p>
        ) : billable.length === 0 ? (
          <p className="empty">Aún no hay fases ni mensualidades definidas.</p>
        ) : (
          billable.map((m) => (
            <div className="doc-row" key={m.id}>
              <span className="doc-name">
                {m.title}
                <br />
                <span className="meta">{m.due_date ? `Vence ${formatDate(m.due_date)}` : 'Sin fecha'}</span>
              </span>
              <span className="row-actions">
                <b style={{ fontFamily: 'var(--font-mono)' }}>{formatMoney(m.amount_usd)}</b>
                <span className={`status-badge ${m.paid ? 'dev' : 'maint'}`}>{m.paid ? 'Pagado' : 'Pendiente'}</span>
              </span>
            </div>
          ))
        )}
        <p style={{ fontSize: 12, color: 'var(--dim-2)', marginTop: 16 }}>
          Para coordinar un pago, escríbenos y te enviaremos los datos de transferencia.
        </p>
      </div>
    </>
  )
}
