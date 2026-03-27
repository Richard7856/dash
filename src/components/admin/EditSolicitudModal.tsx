'use client'

import { useState } from 'react'
import { Solicitud } from '@/lib/types'
import { CLIENTES, TIPOS_SOLICITUD, BANCOS, ESTATUS_OPTIONS } from '@/lib/constants'

interface Props {
  solicitud: Solicitud
  onClose: () => void
  onSaved: () => void
}

export default function EditSolicitudModal({ solicitud, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    nombre: solicitud.nombre,
    apellido_pat: solicitud.apellido_pat,
    apellido_mat: solicitud.apellido_mat,
    cliente: solicitud.cliente,
    banco: solicitud.banco,
    cuenta_clabe: solicitud.cuenta_clabe,
    tipo_solicitud: solicitud.tipo_solicitud,
    monto: String(solicitud.monto),
    razon: solicitud.razon,
    estatus: solicitud.estatus,
    operador_id: solicitud.operador_id || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al guardar')
        return
      }

      onSaved()
      onClose()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Editar solicitud</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre(s)</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Apellido paterno</label>
              <input name="apellido_pat" value={form.apellido_pat} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Apellido materno</label>
              <input name="apellido_mat" value={form.apellido_mat} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ID Operador</label>
              <input name="operador_id" value={form.operador_id} onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
              <select name="cliente" value={form.cliente} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none">
                <option value="">Selecciona</option>
                {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Banco</label>
              <select name="banco" value={BANCOS.includes(form.banco as typeof BANCOS[number]) ? form.banco : ''} onChange={handleChange}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none">
                <option value="">Selecciona</option>
                {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                {!BANCOS.includes(form.banco as typeof BANCOS[number]) && form.banco && (
                  <option value={form.banco}>{form.banco}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cuenta CLABE o tarjeta</label>
              <input name="cuenta_clabe" value={form.cuenta_clabe} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select name="tipo_solicitud" value={form.tipo_solicitud} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none">
                {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Monto ($)</label>
              <input name="monto" type="number" min="1" step="0.01" value={form.monto} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estatus</label>
              <select name="estatus" value={form.estatus} onChange={handleChange} required
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none">
                {ESTATUS_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Razón</label>
            <textarea name="razon" rows={2} value={form.razon} onChange={handleChange} required
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium transition-colors">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
