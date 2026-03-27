'use client'

import { Solicitud } from '@/lib/types'

interface StatsCardsProps {
  solicitudes: Solicitud[]
}

export default function StatsCards({ solicitudes }: StatsCardsProps) {
  const total = solicitudes.length
  const pendientes = solicitudes.filter(s => s.estatus === 'Pendiente').length
  const aprobados = solicitudes.filter(s => s.estatus === 'Aprobado')
  const rechazados = solicitudes.filter(s => s.estatus === 'Rechazado').length
  const montoAprobado = aprobados.reduce((sum, s) => sum + Number(s.monto), 0)

  const stats = [
    { label: 'Total', value: total, color: 'bg-gray-100 text-gray-800' },
    { label: 'Pendientes', value: pendientes, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Aprobados', value: `${aprobados.length} ($${montoAprobado.toLocaleString('es-MX')})`, color: 'bg-green-100 text-green-800' },
    { label: 'Rechazados', value: rechazados, color: 'bg-red-100 text-red-800' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <p className={`text-xl font-semibold inline-block px-2 py-0.5 rounded-md ${stat.color}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
