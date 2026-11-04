import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="center-page">
      <span className="kicker">Error 404</span>
      <h1>Esta ruta no existe</h1>
      <p>La página que buscas se movió o nunca estuvo aquí.</p>
      <Link to="/" className="btn btn-forge">
        Volver al inicio
      </Link>
    </div>
  )
}
