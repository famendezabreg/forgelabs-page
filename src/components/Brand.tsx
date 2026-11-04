import { useId } from 'react'

export function Brand() {
  const id = useId()
  return (
    <span className="brand">
      <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF6A39" />
            <stop offset="1" stopColor="#B8481C" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#46D9C9" />
            <stop offset="1" stopColor="#1F7A70" />
          </linearGradient>
        </defs>
        <path d="M2 16 L14 4 L14 28 Z" fill={`url(#${id}f)`} />
        <path d="M30 16 L18 4 L18 28 Z" fill={`url(#${id}s)`} />
        <rect x="14.6" y="14.6" width="2.8" height="2.8" fill="#fff" transform="rotate(45 16 16)" />
      </svg>
      <span className="brand-name">FORGE LABS</span>
    </span>
  )
}
