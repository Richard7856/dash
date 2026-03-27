export const BANCOS = [
  'BBVA',
  'Banorte',
  'Santander',
  'HSBC',
  'Scotiabank',
  'Citibanamex',
  'Banco Azteca',
  'BanCoppel',
  'Inbursa',
  'Banregio',
  'Afirme',
  'Nu',
  'Hey Banco',
  'Klar',
  'Stori',
  'Mercado Pago',
  'Spin by Oxxo',
  'Rappi',
  'BBASE',
  'Fondeadora',
] as const

export const CLIENTES = [
  'Liverpool tienda',
  'Liverpool CEDIS',
  'La Comer',
  'Bodega Ahorrerra',
  'Bodega Aurrera',
  'Walmart CEDIS',
  'Amazon',
  'Oxxo',
] as const

export const TIPOS_SOLICITUD = [
  'Entrega no reconocida',
  'Retención',
  'Extravío',
  'Anticipo de nómina',
  'Robo',
  'Día pendiente de pago',
  'Ruta no show',
  'Bono',
  'Penalización',
  'Retroactivo',
] as const

// Clasificación contable de cada concepto
export const TIPO_CONTABLE: Record<string, { tipo: 'Cargo' | 'Abono'; descripcion: string }> = {
  'Entrega no reconocida': { tipo: 'Cargo', descripcion: 'Pérdida / ajuste operativo' },
  'Retención': { tipo: 'Cargo', descripcion: 'Dinero retenido a favor de la empresa' },
  'Extravío': { tipo: 'Cargo', descripcion: 'Pérdida de mercancía' },
  'Anticipo de nómina': { tipo: 'Cargo', descripcion: 'Salida de efectivo (activo por recuperar)' },
  'Robo': { tipo: 'Cargo', descripcion: 'Pérdida' },
  'Día pendiente de pago': { tipo: 'Abono', descripcion: 'Pasivo por pagar' },
  'Ruta no show': { tipo: 'Cargo', descripcion: 'Ineficiencia / costo' },
  'Bono': { tipo: 'Cargo', descripcion: 'Gasto' },
  'Penalización': { tipo: 'Abono', descripcion: 'Ingreso / recuperación' },
  'Retroactivo': { tipo: 'Cargo', descripcion: 'Gasto acumulado' },
}

export const ESTATUS_OPTIONS = [
  'Pendiente',
  'En revisión',
  'Aprobado',
  'Rechazado',
] as const

export const ESTATUS_COLORS: Record<string, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'En revisión': 'bg-blue-100 text-blue-800',
  'Aprobado': 'bg-green-100 text-green-800',
  'Rechazado': 'bg-red-100 text-red-800',
}

export const ESTATUS_CHOFERES = [
  'Pendiente',
  'En proceso',
  'Completado',
] as const

export const ESTATUS_CHOFERES_COLORS: Record<string, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'En proceso': 'bg-blue-100 text-blue-800',
  'Completado': 'bg-green-100 text-green-800',
}
