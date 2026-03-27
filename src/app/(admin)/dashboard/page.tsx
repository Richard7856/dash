'use client'

import { useCallback, useEffect, useState } from 'react'
import { Solicitud } from '@/lib/types'
import StatsCards from '@/components/admin/StatsCards'
import FilterBar, { Filters } from '@/components/admin/FilterBar'
import SolicitudesTable from '@/components/admin/SolicitudesTable'

export default function DashboardPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    estatus: '',
    cliente: '',
    tipo_solicitud: '',
    desde: '',
    hasta: '',
    buscar: '',
  })

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.estatus) params.set('estatus', filters.estatus)
    if (filters.cliente) params.set('cliente', filters.cliente)
    if (filters.tipo_solicitud) params.set('tipo_solicitud', filters.tipo_solicitud)
    if (filters.desde) params.set('desde', filters.desde)
    if (filters.hasta) params.set('hasta', filters.hasta)
    if (filters.buscar) params.set('buscar', filters.buscar)

    try {
      const res = await fetch(`/api/solicitudes?${params.toString()}`)
      if (res.ok) {
        const result = await res.json()
        setSolicitudes(result.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const debounce = setTimeout(fetchSolicitudes, 300)
    return () => clearTimeout(debounce)
  }, [fetchSolicitudes])

  return (
    <div className="space-y-6">
      <StatsCards solicitudes={solicitudes} />
      <FilterBar filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <SolicitudesTable solicitudes={solicitudes} onUpdate={fetchSolicitudes} />
      )}
    </div>
  )
}
