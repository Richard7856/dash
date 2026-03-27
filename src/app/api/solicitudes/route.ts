import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CLIENTES, TIPOS_SOLICITUD } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, apellido_pat, apellido_mat, cliente, banco, cuenta_clabe, tipo_solicitud, monto, razon, operador_id } = body

    // Validation
    const errors: string[] = []
    if (!nombre?.trim()) errors.push('Nombre es requerido')
    if (!apellido_pat?.trim()) errors.push('Apellido paterno es requerido')
    if (!apellido_mat?.trim()) errors.push('Apellido materno es requerido')
    if (!cliente || !CLIENTES.includes(cliente)) errors.push('Cliente inválido')
    if (!banco?.trim()) errors.push('Banco es requerido')
    if (!cuenta_clabe?.trim()) errors.push('Cuenta CLABE o tarjeta es requerida')
    if (!tipo_solicitud || !TIPOS_SOLICITUD.includes(tipo_solicitud)) errors.push('Tipo de solicitud inválido')
    if (!monto || Number(monto) <= 0) errors.push('Monto debe ser mayor a 0')
    if (!razon?.trim()) errors.push('Razón es requerida')

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('solicitudes')
      .insert({
        nombre: nombre.trim(),
        apellido_pat: apellido_pat.trim(),
        apellido_mat: apellido_mat.trim(),
        cliente,
        banco: banco.trim(),
        cuenta_clabe: cuenta_clabe.trim(),
        tipo_solicitud,
        monto: Number(monto),
        razon: razon.trim(),
        ...(operador_id ? { operador_id } : {}),
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Monday sync happens ONLY when admin approves (in PATCH route)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estatus = searchParams.get('estatus')
    const cliente = searchParams.get('cliente')
    const tipo_solicitud = searchParams.get('tipo_solicitud')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const buscar = searchParams.get('buscar')
    const limit = Number(searchParams.get('limit') || '50')
    const offset = Number(searchParams.get('offset') || '0')

    let query = supabase
      .from('solicitudes')
      .select('*, operadores(fecha_alta)', { count: 'exact' })

    if (estatus) query = query.eq('estatus', estatus)
    if (cliente) query = query.eq('cliente', cliente)
    if (tipo_solicitud) query = query.eq('tipo_solicitud', tipo_solicitud)
    if (desde) query = query.gte('created_at', desde)
    if (hasta) query = query.lte('created_at', `${hasta}T23:59:59`)
    if (buscar) {
      query = query.or(`nombre.ilike.%${buscar}%,apellido_pat.ilike.%${buscar}%,apellido_mat.ilike.%${buscar}%`)
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, meta: { total: count, limit, offset } })
  } catch {
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 })
  }
}
