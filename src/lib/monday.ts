const MONDAY_API_URL = 'https://api.monday.com/v2'

export async function mondayQuery(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.MONDAY_API_KEY!,
      'API-Version': '2023-07',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Monday API error: ${res.status}`)
  }

  const data = await res.json()
  if (data.errors) {
    throw new Error(`Monday GraphQL error: ${JSON.stringify(data.errors)}`)
  }

  return data
}

// Column IDs for CAJA CHICA 2026 board
export const CAJA_CHICA_COLUMNS = {
  id: 'texto_mkkg806g',
  estatus_operador: 'estado_mkn25ehe',
  concepto: 'estado_mkme2g4c',
  fecha_alta: 'fecha_mkkgffv7',
  cliente: 'estado_mkkgqzgm',
  sucursal: 'men__desplegable_mkkgsexc',
  tipo_empleado: 'men__desplegable_mkn2d5z',
  banco: 'men__desplegable_mkkgxegk',
  no_cuenta: 'no__de_cuenta_mkm7nk39',
  monto: 'n_meros_mkkg9q1w',
  autorizacion: 'estado_mkkk4x51',
  fecha_solicitud: 'fecha_mkkktd62',
  estado: 'estado_mkkkksgc',
  evidencia: 'archivo_mkkrv33y',
  situacion_monto: 'estado_mkmx3jqw',
}

// Column IDs for PLANTILLA DE OPERADORES board (7777838006)
// Note: `name` field is the SUCURSAL, not the operator name
export const PLANTILLA_COLUMNS = {
  id: 'texto__1',
  nombre_completo: 'nombre_completo__1',
  fecha_alta: 'fecha_1__1',
  fecha_baja: 'fecha__1',
  estado: 'estado__1',
  imss: 'estado6__1',
  proyecto: 'estado_mkmk9yf6',
  ciudad: 'estado_mkmt9hn0',
}

// Map tipo_solicitud to Monday CONCEPTO status values
function mapConcepto(tipo: string): string {
  const map: Record<string, string> = {
    'Entrega no reconocida': 'ENTREGA NO RECONOCIDA',
    'Retención': 'RETENCION',
    'Extravío': 'EXTRAVIO',
    'Anticipo de nómina': 'ANTICIPO DE NOMINA',
    'Robo': 'ROBO',
    'Día pendiente de pago': 'DIA PENDIENTE DE PAGO',
    'Ruta no show': 'RUTA NO SHOW',
    'Bono': 'BONO',
    'Penalización': 'PENALIZACION',
    'Retroactivo': 'RETROACTIVO',
  }
  return map[tipo] || tipo.toUpperCase()
}

// Map estatus to Monday ESTADO status values (must match board labels exactly)
// Board only has: EN PROCESO, DEPOSITADO, DECLINADO
function mapEstatus(estatus: string): string {
  const map: Record<string, string> = {
    'Pendiente': 'EN PROCESO',
    'En revisión': 'EN PROCESO',
    'Aprobado': 'DEPOSITADO',
    'Rechazado': 'DECLINADO',
  }
  return map[estatus] || 'EN PROCESO'
}

// Map cliente to Monday CLIENTE status values (must match board labels exactly)
function mapCliente(cliente: string): string {
  const map: Record<string, string> = {
    'Liverpool tienda': 'LIVERPOOL TIENDAS',
    'Liverpool CEDIS': 'LIVERPOOL CEDIS',
    'La Comer': 'LA COMER',
    'Bodega Ahorrerra': 'BODEGA AURRERA',
    'Bodega Aurrera': 'BODEGA AURRERA',
    'Walmart CEDIS': 'WALMART FINSA',
    'Amazon': 'AMAZON',
    'Oxxo': 'OXXO',
  }
  return map[cliente] || cliente.toUpperCase()
}

export interface SolicitudForMonday {
  nombre: string
  operador_id?: string | null
  cliente: string
  banco: string
  cuenta_clabe: string
  tipo_solicitud: string
  monto: number
  estatus: string
  sucursal?: string | null
  fecha_alta?: string | null
}

// Get the first (most recent) group ID from the board
export async function getFirstGroupId(): Promise<string | null> {
  const boardId = process.env.MONDAY_BOARD_CAJA_CHICA
  if (!boardId || !process.env.MONDAY_API_KEY) return null

  const query = `query ($boardId: [ID!]!) {
    boards (ids: $boardId) {
      groups { id }
    }
  }`

  try {
    const result = await mondayQuery(query, { boardId: [boardId] })
    const groups = result.data?.boards?.[0]?.groups || []
    return groups[0]?.id || null
  } catch (e) {
    console.error('Monday get groups error:', e)
    return null
  }
}

// Create item in a specific group (used when approving)
export async function createMondayItemInGroup(solicitud: SolicitudForMonday, groupId: string | null) {
  const boardId = process.env.MONDAY_BOARD_CAJA_CHICA
  if (!boardId || !process.env.MONDAY_API_KEY) return null

  const columnValues: Record<string, unknown> = {
    [CAJA_CHICA_COLUMNS.id]: solicitud.operador_id || '',
    [CAJA_CHICA_COLUMNS.concepto]: { label: mapConcepto(solicitud.tipo_solicitud) },
    [CAJA_CHICA_COLUMNS.cliente]: { label: mapCliente(solicitud.cliente) },
    [CAJA_CHICA_COLUMNS.banco]: { labels: [solicitud.banco] },
    [CAJA_CHICA_COLUMNS.no_cuenta]: solicitud.cuenta_clabe,
    [CAJA_CHICA_COLUMNS.monto]: solicitud.monto,
    [CAJA_CHICA_COLUMNS.estado]: { label: mapEstatus(solicitud.estatus) },
    [CAJA_CHICA_COLUMNS.fecha_solicitud]: { date: new Date().toISOString().split('T')[0] },
    [CAJA_CHICA_COLUMNS.tipo_empleado]: { labels: ['OPERADOR'] },
  }

  // Note: Sucursal is a dropdown with fixed labels in Monday.
  // We skip it to avoid errors when the label doesn't exist.
  // It can be filled manually in Monday if needed.

  // Add fecha_alta if available
  if (solicitud.fecha_alta) {
    const fechaStr = new Date(solicitud.fecha_alta).toISOString().split('T')[0]
    columnValues[CAJA_CHICA_COLUMNS.fecha_alta] = { date: fechaStr }
  }

  // Use group_id if available
  const groupPart = groupId ? `, group_id: $groupId` : ''
  const query = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!${groupId ? ', $groupId: String!' : ''}) {
    create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues${groupPart}) {
      id
    }
  }`

  const variables: Record<string, unknown> = {
    boardId,
    itemName: solicitud.nombre,
    columnValues: JSON.stringify(columnValues),
  }
  if (groupId) variables.groupId = groupId

  try {
    const result = await mondayQuery(query, variables)
    return result.data?.create_item?.id || null
  } catch (e) {
    console.error('Monday create item error:', e)
    return null
  }
}

// Fetch all items from CAJA CHICA board and map to Solicitud-like format
export async function fetchMondayItems(): Promise<MondayItem[]> {
  const boardId = process.env.MONDAY_BOARD_CAJA_CHICA
  if (!boardId || !process.env.MONDAY_API_KEY) return []

  const columnIds = [
    CAJA_CHICA_COLUMNS.id,
    CAJA_CHICA_COLUMNS.concepto,
    CAJA_CHICA_COLUMNS.cliente,
    CAJA_CHICA_COLUMNS.banco,
    CAJA_CHICA_COLUMNS.no_cuenta,
    CAJA_CHICA_COLUMNS.monto,
    CAJA_CHICA_COLUMNS.estado,
    CAJA_CHICA_COLUMNS.fecha_solicitud,
    CAJA_CHICA_COLUMNS.autorizacion,
    CAJA_CHICA_COLUMNS.situacion_monto,
  ]

  const query = `query ($boardId: [ID!]!, $columnIds: [String!]) {
    boards (ids: $boardId) {
      items_page (limit: 500) {
        cursor
        items {
          id
          name
          created_at
          column_values (ids: $columnIds) {
            id
            text
            value
          }
        }
      }
    }
  }`

  try {
    const result = await mondayQuery(query, { boardId: [boardId], columnIds })
    const items = result.data?.boards?.[0]?.items_page?.items || []

    return items.map((item: MondayRawItem) => {
      const cols: Record<string, string> = {}
      for (const col of item.column_values) {
        cols[col.id] = col.text || ''
      }

      const estadoRaw = cols[CAJA_CHICA_COLUMNS.estado] || ''
      const estatus = mapMondayEstatusToLocal(estadoRaw)

      return {
        id: `monday_${item.id}`,
        monday_item_id: item.id,
        nombre: item.name,
        apellido_pat: '',
        apellido_mat: '',
        operador_id: cols[CAJA_CHICA_COLUMNS.id] || null,
        cliente: cols[CAJA_CHICA_COLUMNS.cliente] || '',
        banco: cols[CAJA_CHICA_COLUMNS.banco] || '',
        cuenta_clabe: cols[CAJA_CHICA_COLUMNS.no_cuenta] || '',
        tipo_solicitud: cols[CAJA_CHICA_COLUMNS.concepto] || '',
        monto: parseFloat(cols[CAJA_CHICA_COLUMNS.monto]?.replace(/,/g, '') || '0') || 0,
        razon: '',
        estatus,
        estatus_monday: estadoRaw,  // Original Monday status text
        autorizacion: cols[CAJA_CHICA_COLUMNS.autorizacion] || '',
        situacion_monto: cols[CAJA_CHICA_COLUMNS.situacion_monto] || '',
        created_at: cols[CAJA_CHICA_COLUMNS.fecha_solicitud] || item.created_at,
        updated_at: item.created_at,
        source: 'monday' as const,
      }
    })
  } catch (e) {
    console.error('Monday fetch items error:', e)
    return []
  }
}

function mapMondayEstatusToLocal(estatus: string): string {
  if (!estatus) return 'Pendiente'
  const upper = estatus.toUpperCase().trim()
  if (upper.includes('DEPOSITADO')) return 'Aprobado'
  if (upper.includes('APROBADO') || upper.includes('AUTORIZADO')) return 'Aprobado'
  if (upper.includes('RECHAZADO') || upper.includes('CANCELADO')) return 'Rechazado'
  if (upper.includes('REVISION') || upper.includes('REVISIÓN') || upper.includes('PROCESO')) return 'En revisión'
  if (upper.includes('PENDIENTE')) return 'Pendiente'
  // If it has a value but doesn't match, show as-is
  return estatus
}

interface MondayRawItem {
  id: string
  name: string
  created_at: string
  column_values: { id: string; text: string; value: string }[]
}

export interface MondayItem {
  id: string
  monday_item_id: string
  nombre: string
  apellido_pat: string
  apellido_mat: string
  operador_id: string | null
  cliente: string
  banco: string
  cuenta_clabe: string
  tipo_solicitud: string
  monto: number
  razon: string
  estatus: string
  estatus_monday: string
  autorizacion: string
  situacion_monto: string
  created_at: string
  updated_at: string
  source: 'monday'
}

// Update any changed fields on a Monday item
export async function updateMondayItem(mondayItemId: string, fields: Partial<SolicitudForMonday> & { nombre?: string }) {
  const boardId = process.env.MONDAY_BOARD_CAJA_CHICA
  if (!boardId || !process.env.MONDAY_API_KEY || !mondayItemId) return

  const columnValues: Record<string, unknown> = {}

  if (fields.operador_id !== undefined) columnValues[CAJA_CHICA_COLUMNS.id] = fields.operador_id || ''
  if (fields.tipo_solicitud) columnValues[CAJA_CHICA_COLUMNS.concepto] = { label: mapConcepto(fields.tipo_solicitud) }
  if (fields.cliente) columnValues[CAJA_CHICA_COLUMNS.cliente] = { label: mapCliente(fields.cliente) }
  if (fields.banco) columnValues[CAJA_CHICA_COLUMNS.banco] = { labels: [fields.banco] }
  if (fields.cuenta_clabe) columnValues[CAJA_CHICA_COLUMNS.no_cuenta] = fields.cuenta_clabe
  if (fields.monto !== undefined) columnValues[CAJA_CHICA_COLUMNS.monto] = fields.monto
  if (fields.estatus) columnValues[CAJA_CHICA_COLUMNS.estado] = { label: mapEstatus(fields.estatus) }

  if (Object.keys(columnValues).length === 0) return

  const query = `mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
    change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
      id
    }
  }`

  try {
    await mondayQuery(query, {
      boardId,
      itemId: mondayItemId,
      columnValues: JSON.stringify(columnValues),
    })

    // Also update item name if nombre changed
    if (fields.nombre) {
      const renameQuery = `mutation ($itemId: ID!, $columnId: String!, $value: String!) {
        change_simple_column_value (item_id: $itemId, board_id: ${boardId}, column_id: $columnId, value: $value) {
          id
        }
      }`
      await mondayQuery(renameQuery, {
        itemId: mondayItemId,
        columnId: 'name',
        value: fields.nombre,
      }).catch(() => {})
    }
  } catch (e) {
    console.error('Monday update error:', e)
  }
}

// Backwards compatible alias
export async function updateMondayItemStatus(mondayItemId: string, estatus: string) {
  return updateMondayItem(mondayItemId, { estatus })
}

// ========== PLANTILLA SYNC ==========

export interface MondayOperador {
  monday_item_id: string
  id: string // operador ID (texto__1)
  nombre_completo: string
  sucursal: string
  fecha_alta: string | null
  fecha_baja: string | null
  estado: string
  imss: string
  proyecto: string
  ciudad: string
}

// Fetch all operadores from Monday PLANTILLA board (paginated)
export async function fetchAllOperadoresFromMonday(): Promise<MondayOperador[]> {
  const boardId = process.env.MONDAY_BOARD_PLANTILLA
  if (!boardId || !process.env.MONDAY_API_KEY) return []

  const columnIds = [
    PLANTILLA_COLUMNS.id,
    PLANTILLA_COLUMNS.nombre_completo,
    PLANTILLA_COLUMNS.fecha_alta,
    PLANTILLA_COLUMNS.fecha_baja,
    PLANTILLA_COLUMNS.estado,
    PLANTILLA_COLUMNS.imss,
    PLANTILLA_COLUMNS.proyecto,
    PLANTILLA_COLUMNS.ciudad,
  ]

  const allItems: MondayOperador[] = []
  let cursor: string | null = null

  // First page
  const firstQuery = `query ($boardId: [ID!]!, $columnIds: [String!]) {
    boards(ids: $boardId) {
      items_page(limit: 500) {
        cursor
        items {
          id
          name
          column_values(ids: $columnIds) { id text }
        }
      }
    }
  }`

  const nextQuery = `query ($cursor: String!, $columnIds: [String!]) {
    next_items_page(limit: 500, cursor: $cursor) {
      cursor
      items {
        id
        name
        column_values(ids: $columnIds) { id text }
      }
    }
  }`

  try {
    // First page
    const firstResult = await mondayQuery(firstQuery, { boardId: [boardId], columnIds })
    const firstPage = firstResult.data?.boards?.[0]?.items_page
    if (!firstPage) return []

    allItems.push(...parseOperadorItems(firstPage.items || []))
    cursor = firstPage.cursor

    // Subsequent pages
    while (cursor) {
      const nextResult = await mondayQuery(nextQuery, { cursor, columnIds })
      const nextPage = nextResult.data?.next_items_page
      if (!nextPage || !nextPage.items?.length) break

      allItems.push(...parseOperadorItems(nextPage.items))
      cursor = nextPage.cursor
    }
  } catch (e) {
    console.error('Monday fetch operadores error:', e)
  }

  return allItems
}

function parseOperadorItems(items: MondayRawItem[]): MondayOperador[] {
  return items.map(item => {
    const cols: Record<string, string> = {}
    for (const col of item.column_values) {
      cols[col.id] = col.text || ''
    }

    // In this board, `item.name` is the SUCURSAL, not the operator name
    // The actual name is in the `nombre_completo__1` column
    const nombreCompleto = cols[PLANTILLA_COLUMNS.nombre_completo] || item.name
    const sucursal = item.name // The item name is actually the sucursal

    return {
      monday_item_id: item.id,
      id: cols[PLANTILLA_COLUMNS.id] || '',
      nombre_completo: nombreCompleto,
      sucursal,
      fecha_alta: cols[PLANTILLA_COLUMNS.fecha_alta] || null,
      fecha_baja: cols[PLANTILLA_COLUMNS.fecha_baja] || null,
      estado: cols[PLANTILLA_COLUMNS.estado] || '',
      imss: cols[PLANTILLA_COLUMNS.imss] || '',
      proyecto: cols[PLANTILLA_COLUMNS.proyecto] || '',
      ciudad: cols[PLANTILLA_COLUMNS.ciudad] || '',
    }
  })
}
