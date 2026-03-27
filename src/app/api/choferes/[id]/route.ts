import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ESTATUS_CHOFERES } from '@/lib/constants'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { estatus } = body

    if (!estatus || !ESTATUS_CHOFERES.includes(estatus)) {
      return NextResponse.json({ error: 'Estatus inválido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { estatus }

    // Auto-set completed_at when marking as Completado
    if (estatus === 'Completado') {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { data, error } = await supabase
      .from('solicitudes_choferes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar solicitud' }, { status: 500 })
  }
}
