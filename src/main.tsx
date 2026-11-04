import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/site.css'
import './styles/app.css'
import './styles/home.css'
import App from './App.tsx'

document.documentElement.classList.add('js-ready')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
