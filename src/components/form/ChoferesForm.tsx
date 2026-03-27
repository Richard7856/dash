'use client'

import { useState } from 'react'
import { CLIENTES } from '@/lib/constants'

export default function ChoferesForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    cliente: '',
    cantidad: '',
    notas: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/choferes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al enviar solicitud')
        return
      }

      setSuccess(true)
      setForm({ cliente: '', cantidad: '', notas: '' })
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Solicitud enviada</h2>
        <p className="text-gray-600 mb-6">Tu solicitud de choferes ha sido registrada. El equipo de RH la revisará.</p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Enviar otra solicitud
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Proyecto (Cliente)</label>
        <select
          id="cliente" name="cliente" required value={form.cliente} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
        >
          <option value="">Selecciona un proyecto</option>
          {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad de choferes</label>
        <input
          id="cantidad" name="cantidad" type="number" required min="1" value={form.cantidad} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          placeholder="1"
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">Notas <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea
          id="notas" name="notas" rows={3} value={form.notas} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
          placeholder="Detalles adicionales sobre la solicitud..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Enviando...' : 'Solicitar choferes'}
      </button>
    </form>
  )
}
