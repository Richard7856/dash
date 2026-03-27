'use client'

import { useState, useRef, useEffect } from 'react'
import { Operador } from '@/lib/types'

interface Props {
  onSelect: (operador: Operador) => void
  onClear: () => void
  selected: Operador | null
}

export default function OperadorSearch({ onSelect, onClear, selected }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Operador[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/operadores?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.data || [])
          setOpen(true)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (selected) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-teal-900">{selected.nombre_completo}</p>
          <p className="text-xs text-teal-600">ID: {selected.id} &middot; {selected.proyecto}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-teal-400 hover:text-teal-600"
          title="Cambiar operador"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Busca tu nombre</label>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        placeholder="Escribe tu nombre para buscar..."
      />
      {loading && (
        <div className="absolute right-3 top-9">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500" />
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {results.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => { onSelect(op); setOpen(false); setQuery('') }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 border-b border-gray-50 last:border-0"
            >
              <span className="font-medium text-gray-900">{op.nombre_completo}</span>
              <span className="text-gray-400 ml-2 text-xs">ID: {op.id} &middot; {op.proyecto}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
          No se encontró. Llena tus datos manualmente abajo.
        </div>
      )}
    </div>
  )
}
