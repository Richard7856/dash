'use client'

import { SolicitudChofer } from '@/lib/types'

export default function ChoferesStatsCards({ solicitudes }: { solicitudes: SolicitudChofer[] }) {
  const total = solicitudes.length
  const pendientes = solicitudes.filter(s => s.estatus === 'Pendiente').length
  const completadas = solicitudes.filter(s => s.estatus === 'Completado')
  const totalChoferes = solicitudes.reduce((sum, s) => sum + s.cantidad, 0)

  const promedioDias = completadas.length > 0
    ? completadas.reduce((sum, s) => {
        const start = new Date(s.created_at)
        const end = new Date(s.completed_at!)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      }, 0) / completadas.length
    : 0

  const stats = [
    { label: 'Total solicitudes', value: total, sub: `${totalChoferes} choferes`, color: 'text-gray-900' },
    { label: 'Pendientes', value: pendientes, sub: null, color: 'text-yellow-600' },
    { label: 'Completadas', value: completadas.length, sub: null, color: 'text-green-600' },
    { label: 'Promedio días', value: promedioDias > 0 ? promedioDias.toFixed(1) : '—', sub: 'para completar', color: 'text-blue-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{s.label}</p>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
        </div>
      ))}
    </div>
  )
}
