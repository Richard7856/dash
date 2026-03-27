'use client'

import { CLIENTES, ESTATUS_OPTIONS, TIPOS_SOLICITUD } from '@/lib/constants'

export interface Filters {
  estatus: string
  cliente: string
  tipo_solicitud: string
  desde: string
  hasta: string
  buscar: string
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Nombre..."
            value={filters.buscar}
            onChange={e => update('buscar', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estatus</label>
          <select
            value={filters.estatus}
            onChange={e => update('estatus', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
          >
            <option value="">Todos</option>
            {ESTATUS_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
          <select
            value={filters.cliente}
            onChange={e => update('cliente', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
          >
            <option value="">Todos</option>
            {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={filters.tipo_solicitud}
            onChange={e => update('tipo_solicitud', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
          >
            <option value="">Todos</option>
            {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={filters.desde}
            onChange={e => update('desde', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={filters.hasta}
            onChange={e => update('hasta', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
