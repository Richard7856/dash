'use client'

import { CLIENTES, ESTATUS_CHOFERES } from '@/lib/constants'

export interface ChoferesFilters {
  estatus: string
  cliente: string
  desde: string
  hasta: string
}

export default function ChoferesFilterBar({ filters, onChange }: { filters: ChoferesFilters; onChange: (f: ChoferesFilters) => void }) {
  const update = (key: keyof ChoferesFilters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estatus</label>
          <select
            value={filters.estatus} onChange={e => update('estatus', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          >
            <option value="">Todos</option>
            {ESTATUS_CHOFERES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
          <select
            value={filters.cliente} onChange={e => update('cliente', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-teal-500 outline-none"
          >
            <option value="">Todos</option>
            {CLIENTES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input
            type="date" value={filters.desde} onChange={e => update('desde', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input
            type="date" value={filters.hasta} onChange={e => update('hasta', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
