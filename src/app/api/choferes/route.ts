import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CLIENTES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cliente, cantidad, notas } = body

    const errors: string[] = []
    if (!cliente || !CLIENTES.includes(cliente)) errors.push('Cliente inválido')
    if (!cantidad || Number(cantidad) < 1) errors.push('Cantidad debe ser al menos 1')

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('solicitudes_choferes')
      .insert({
        cliente,
        cantidad: Number(cantidad),
        notas: notas?.trim() || null,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    let query = supabase
      .from('solicitudes_choferes')
      .select('*', { count: 'exact' })

    if (estatus) query = query.eq('estatus', estatus)
    if (cliente) query = query.eq('cliente', cliente)
    if (desde) query = query.gte('created_at', desde)
    if (hasta) query = query.lte('created_at', `${hasta}T23:59:59`)

    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, meta: { total: count } })
  } catch {
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 })
  }
}
