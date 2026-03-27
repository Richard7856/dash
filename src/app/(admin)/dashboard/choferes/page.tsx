'use client'

import { useCallback, useEffect, useState } from 'react'
import { SolicitudChofer } from '@/lib/types'
import ChoferesStatsCards from '@/components/admin/ChoferesStatsCards'
import ChoferesFilterBar, { ChoferesFilters } from '@/components/admin/ChoferesFilterBar'
import ChoferesTable from '@/components/admin/ChoferesTable'

export default function ChoferesDashboardPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudChofer[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ChoferesFilters>({
    estatus: '',
    cliente: '',
    desde: '',
    hasta: '',
  })

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.estatus) params.set('estatus', filters.estatus)
    if (filters.cliente) params.set('cliente', filters.cliente)
    if (filters.desde) params.set('desde', filters.desde)
    if (filters.hasta) params.set('hasta', filters.hasta)

    try {
      const res = await fetch(`/api/choferes?${params.toString()}`)
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
      <ChoferesStatsCards solicitudes={solicitudes} />
      <ChoferesFilterBar filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <ChoferesTable solicitudes={solicitudes} onUpdate={fetchSolicitudes} />
      )}
    </div>
  )
}
