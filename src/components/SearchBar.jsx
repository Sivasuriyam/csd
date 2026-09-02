import { useEffect, useRef, useState } from 'react'

export default function SearchBar({ value, onChange, placeholder }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)

  useEffect(() => setLocal(value), [value])

  function handleChange(e) {
    const next = e.target.value
    setLocal(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(next), 300)
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        🔍
      </span>
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder || 'Search by customer, subject, or ID…'}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}
