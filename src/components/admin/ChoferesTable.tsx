'use client'

import { useState } from 'react'
import { SolicitudChofer } from '@/lib/types'
import { ESTATUS_CHOFERES, ESTATUS_CHOFERES_COLORS } from '@/lib/constants'

function getDays(createdAt: string, completedAt: string | null): number {
  const start = new Date(createdAt)
  const end = completedAt ? new Date(completedAt) : new Date()
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function getDaysBadgeColor(days: number): string {
  if (days <= 3) return 'bg-green-100 text-green-700'
  if (days <= 7) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export default function ChoferesTable({ solicitudes, onUpdate }: { solicitudes: SolicitudChofer[]; onUpdate: () => void }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (id: string, estatus: string) => {
    setUpdatingId(id)
    try {
      await fetch(`/api/choferes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus }),
      })
      onUpdate()
    } finally {
      setUpdatingId(null)
    }
  }

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        No hay solicitudes de choferes
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Cantidad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Notas</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estatus</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Días</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map(s => {
              const days = getDays(s.created_at, s.completed_at)
              const isCompleted = s.estatus === 'Completado'

              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.cliente}</td>
                  <td className="px-4 py-3 text-gray-700">{s.cantidad}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-48 truncate">{s.notas || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.estatus}
                      onChange={e => handleStatusChange(s.id, e.target.value)}
                      disabled={updatingId === s.id}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ESTATUS_CHOFERES_COLORS[s.estatus] || 'bg-gray-100 text-gray-700'} ${updatingId === s.id ? 'opacity-50' : ''}`}
                    >
                      {ESTATUS_CHOFERES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(s.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDaysBadgeColor(days)}`}>
                        {days}d
                      </span>
                      {/* Timeline bar */}
                      <div className="hidden sm:block w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${days <= 3 ? 'bg-green-400' : days <= 7 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(100, (days / 14) * 100)}%` }}
                        />
                      </div>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
