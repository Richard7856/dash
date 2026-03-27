'use client'

import { useState, useRef, useEffect } from 'react'
import { CLIENTES, TIPOS_SOLICITUD, BANCOS } from '@/lib/constants'
import { Operador } from '@/lib/types'
import OperadorSearch from './OperadorSearch'

export default function SolicitudForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    apellido_pat: '',
    apellido_mat: '',
    cliente: '',
    banco: '',
    cuenta_clabe: '',
    tipo_solicitud: '',
    monto: '',
    razon: '',
    operador_id: '',
  })
  const [bancoSearch, setBancoSearch] = useState('')
  const [bancoOpen, setBancoOpen] = useState(false)
  const [bancoIsOtro, setBancoIsOtro] = useState(false)
  const bancoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bancoRef.current && !bancoRef.current.contains(e.target as Node)) {
        setBancoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al enviar solicitud')
        return
      }

      setSuccess(true)
      setBancoIsOtro(false)
      setBancoSearch('')
      setSelectedOperador(null)
      setForm({
        nombre: '', apellido_pat: '', apellido_mat: '', cliente: '',
        banco: '', cuenta_clabe: '', tipo_solicitud: '', monto: '',
        razon: '', operador_id: '',
      })
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
        <p className="text-gray-600 mb-6">Tu solicitud ha sido registrada correctamente. Será revisada por el equipo de Taimingo.</p>
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

      <OperadorSearch
        selected={selectedOperador}
        onSelect={(op) => {
          setSelectedOperador(op)
          const parts = op.nombre_completo.split(/\s+/)
          const apellido_mat = parts.pop() || ''
          const apellido_pat = parts.pop() || ''
          const nombre = parts.join(' ')
          // Map proyecto to cliente value
          const proyectoMap: Record<string, string> = {
            'LA COMER': 'La Comer',
            'BODEGA AURRERA': 'Bodega Aurrera',
            'WALMART CEDIS': 'Walmart CEDIS',
            'AMAZON': 'Amazon',
            'LIVERPOOL TIENDAS': 'Liverpool tienda',
            'LIVERPOOL CEDIS': 'Liverpool CEDIS',
            'OXXO': 'Oxxo',
          }
          const cliente = op.proyecto ? (proyectoMap[op.proyecto] || '') : ''
          setForm(prev => ({ ...prev, nombre, apellido_pat, apellido_mat, operador_id: op.id, cliente }))
        }}
        onClear={() => {
          setSelectedOperador(null)
          setForm(prev => ({ ...prev, nombre: '', apellido_pat: '', apellido_mat: '', operador_id: '', cliente: '' }))
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
          <input
            id="nombre" name="nombre" type="text" required value={form.nombre} onChange={handleChange}
            readOnly={!!selectedOperador}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${selectedOperador ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder="Juan Carlos"
          />
        </div>
        <div>
          <label htmlFor="apellido_pat" className="block text-sm font-medium text-gray-700 mb-1">Apellido paterno</label>
          <input
            id="apellido_pat" name="apellido_pat" type="text" required value={form.apellido_pat} onChange={handleChange}
            readOnly={!!selectedOperador}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${selectedOperador ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder="García"
          />
        </div>
        <div>
          <label htmlFor="apellido_mat" className="block text-sm font-medium text-gray-700 mb-1">Apellido materno</label>
          <input
            id="apellido_mat" name="apellido_mat" type="text" required value={form.apellido_mat} onChange={handleChange}
            readOnly={!!selectedOperador}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${selectedOperador ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder="López"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        {selectedOperador && form.cliente ? (
          <input
            type="text" readOnly value={form.cliente}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none"
          />
        ) : (
          <select
            id="cliente" name="cliente" required value={form.cliente} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
          >
            <option value="">Selecciona un cliente</option>
            {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <input type="hidden" name="cliente" value={form.cliente} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div ref={bancoRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
          {bancoIsOtro ? (
            <div className="flex gap-2">
              <input
                type="text" required value={form.banco}
                onChange={e => setForm(prev => ({ ...prev, banco: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Escribe el nombre del banco"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setBancoIsOtro(false); setForm(prev => ({ ...prev, banco: '' })); setBancoSearch('') }}
                className="px-2 text-gray-400 hover:text-gray-600 shrink-0"
                title="Volver a lista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <>
              <div
                onClick={() => setBancoOpen(!bancoOpen)}
                className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between ${bancoOpen ? 'ring-2 ring-teal-500 border-teal-500' : 'border-gray-300'}`}
              >
                <span className={form.banco ? 'text-gray-900' : 'text-gray-400'}>{form.banco || 'Selecciona banco'}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${bancoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              {bancoOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text" value={bancoSearch} onChange={e => setBancoSearch(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      placeholder="Buscar banco..."
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-44">
                    {BANCOS
                      .filter(b => b.toLowerCase().includes(bancoSearch.toLowerCase()))
                      .map(b => (
                        <button
                          key={b} type="button"
                          onClick={() => { setForm(prev => ({ ...prev, banco: b })); setBancoOpen(false); setBancoSearch('') }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 ${form.banco === b ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'}`}
                        >
                          {b}
                        </button>
                      ))
                    }
                    {BANCOS.filter(b => b.toLowerCase().includes(bancoSearch.toLowerCase())).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setBancoIsOtro(true); setBancoOpen(false); setForm(prev => ({ ...prev, banco: '' })); setBancoSearch('') }}
                      className="w-full text-left px-3 py-2 text-sm text-teal-600 font-medium hover:bg-teal-50 border-t border-gray-100"
                    >
                      Otro banco...
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <input type="hidden" name="banco" value={form.banco} required />
        </div>
        <div>
          <label htmlFor="cuenta_clabe" className="block text-sm font-medium text-gray-700 mb-1">Cuenta CLABE o tarjeta</label>
          <input
            id="cuenta_clabe" name="cuenta_clabe" type="text" inputMode="numeric" pattern="[0-9]*" required value={form.cuenta_clabe}
            onChange={e => { const v = e.target.value.replace(/\D/g, ''); setForm(prev => ({ ...prev, cuenta_clabe: v })) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="Número de cuenta CLABE o tarjeta"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tipo_solicitud" className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud</label>
          <select
            id="tipo_solicitud" name="tipo_solicitud" required value={form.tipo_solicitud} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
          >
            <option value="">Selecciona tipo</option>
            {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
          <input
            id="monto" name="monto" type="text" inputMode="decimal" required value={form.monto}
            onChange={e => { const v = e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'); setForm(prev => ({ ...prev, monto: v })) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="razon" className="block text-sm font-medium text-gray-700 mb-1">Razón</label>
        <textarea
          id="razon" name="razon" required rows={3} value={form.razon} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
          placeholder="Describe el motivo de tu solicitud..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
