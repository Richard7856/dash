export interface Solicitud {
  id: string
  nombre: string
  apellido_pat: string
  apellido_mat: string
  cliente: string
  banco: string
  cuenta_clabe: string
  tipo_solicitud: string
  monto: number
  razon: string
  estatus: string
  operador_id: string | null
  monday_item_id: string | null
  created_at: string
  updated_at: string
  operadores?: { fecha_alta: string | null } | null
  source?: 'local' | 'monday'
  estatus_monday?: string
  autorizacion?: string
  situacion_monto?: string
}

export type SolicitudInsert = Omit<Solicitud, 'id' | 'estatus' | 'created_at' | 'updated_at'>

export type Estatus = 'Pendiente' | 'En revisión' | 'Aprobado' | 'Rechazado'

export interface SolicitudChofer {
  id: string
  cliente: string
  cantidad: number
  notas: string | null
  estatus: string
  created_at: string
  completed_at: string | null
  updated_at: string
}

export type EstatusChofer = 'Pendiente' | 'En proceso' | 'Completado'

export interface Operador {
  id: string
  nombre_completo: string
  sucursal: string | null
  proyecto: string | null
  ciudad: string | null
  estado: string
  fecha_alta: string | null
}

export interface EvidenciaPago {
  id: string
  solicitud_id: string
  url: string
  filename: string
  created_at: string
}
