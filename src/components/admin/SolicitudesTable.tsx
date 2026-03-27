'use client'

import { useState } from 'react'
import { Solicitud } from '@/lib/types'
import { ESTATUS_OPTIONS, ESTATUS_COLORS, TIPO_CONTABLE } from '@/lib/constants'
import EvidenciaModal from './EvidenciaModal'
import EditSolicitudModal from './EditSolicitudModal'

interface SolicitudesTableProps {
  solicitudes: Solicitud[]
  onUpdate: () => void
}

export default function SolicitudesTable({ solicitudes, onUpdate }: SolicitudesTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [evidenciaId, setEvidenciaId] = useState<string | null>(null)
  const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null)

  const handleStatusChange = async (id: string, estatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus }),
      })

      if (res.ok) {
        onUpdate()
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar solicitud de ${nombre}?`)) return
    try {
      const res = await fetch(`/api/solicitudes/${id}`, { method: 'DELETE' })
      if (res.ok) onUpdate()
    } catch { /* ignore */ }
  }

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        No se encontraron solicitudes
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID Op.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Alta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estatus</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Ev.</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(s => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-mono text-gray-500">{s.operador_id || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.operadores?.fecha_alta
                      ? new Date(s.operadores.fecha_alta).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.nombre} {s.apellido_pat} {s.apellido_mat}</div>
                    <div className="text-xs text-gray-500">{s.banco} - {s.cuenta_clabe}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.cliente}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700 text-xs">{s.tipo_solicitud}</div>
                    {TIPO_CONTABLE[s.tipo_solicitud] && (
                      <span className={`inline-block text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded ${TIPO_CONTABLE[s.tipo_solicitud].tipo === 'Cargo' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {TIPO_CONTABLE[s.tipo_solicitud].tipo === 'Cargo' ? 'Debe' : 'Haber'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${Number(s.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={s.estatus}
                        onChange={e => handleStatusChange(s.id, e.target.value)}
                        disabled={updatingId === s.id}
                        className={`text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-full border border-gray-200 cursor-pointer appearance-none ${ESTATUS_COLORS[s.estatus] || 'bg-gray-100 text-gray-800'} ${updatingId === s.id ? 'opacity-50' : ''}`}
                      >
                        {ESTATUS_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(s.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEvidenciaId(s.id)}
                      className="text-gray-400 hover:text-teal-600 transition-colors"
                      title="Evidencia de pago"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditingSolicitud(s)}
                      className="text-gray-400 hover:text-teal-600 transition-colors"
                      title="Editar solicitud"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(s.id, `${s.nombre} ${s.apellido_pat}`)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Eliminar solicitud"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {evidenciaId && (
        <EvidenciaModal solicitudId={evidenciaId} onClose={() => setEvidenciaId(null)} />
      )}
      {editingSolicitud && (
        <EditSolicitudModal solicitud={editingSolicitud} onClose={() => setEditingSolicitud(null)} onSaved={onUpdate} />
      )}
    </>
  )
}
