import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMondayItemInGroup, updateMondayItem, getFirstGroupId } from '@/lib/monday'

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

    // Allow updating any editable field
    const allowed = ['estatus', 'nombre', 'apellido_pat', 'apellido_mat', 'cliente', 'banco', 'cuenta_clabe', 'tipo_solicitud', 'monto', 'razon', 'operador_id']
    const updateData: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updateData[key] = key === 'monto' ? Number(body[key]) : body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('solicitudes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // When approved and NOT yet in Monday → create item in most recent group
    if (body.estatus === 'Aprobado' && !data.monday_item_id) {
      const fullName = `${data.nombre} ${data.apellido_pat} ${data.apellido_mat}`
      const groupId = await getFirstGroupId()

      // Fetch operador data for sucursal & fecha_alta
      let operadorData: { sucursal?: string; fecha_alta?: string } = {}
      if (data.operador_id) {
        const { data: op } = await supabase
          .from('operadores')
          .select('sucursal, fecha_alta')
          .eq('id', data.operador_id)
          .single()
        if (op) operadorData = op
      }

      createMondayItemInGroup({
        nombre: fullName,
        operador_id: data.operador_id || null,
        cliente: data.cliente,
        banco: data.banco,
        cuenta_clabe: data.cuenta_clabe,
        tipo_solicitud: data.tipo_solicitud,
        monto: Number(data.monto),
        estatus: 'Aprobado',
        sucursal: operadorData.sucursal || null,
        fecha_alta: operadorData.fecha_alta || null,
      }, groupId).then(async (mondayItemId) => {
        if (mondayItemId) {
          console.log(`Monday item created on approval: ${mondayItemId}`)
          await supabase
            .from('solicitudes')
            .update({ monday_item_id: String(mondayItemId) })
            .eq('id', id)
        }
      }).catch((e) => console.error('Monday create on approval error:', e))
    }
    // If already in Monday → sync changed fields
    else if (data.monday_item_id) {
      const mondayFields: Record<string, unknown> = {}
      if (body.estatus) mondayFields.estatus = body.estatus
      if (body.cliente) mondayFields.cliente = body.cliente
      if (body.banco) mondayFields.banco = body.banco
      if (body.cuenta_clabe) mondayFields.cuenta_clabe = body.cuenta_clabe
      if (body.tipo_solicitud) mondayFields.tipo_solicitud = body.tipo_solicitud
      if (body.monto !== undefined) mondayFields.monto = Number(body.monto)
      if (body.operador_id !== undefined) mondayFields.operador_id = body.operador_id
      if (body.nombre || body.apellido_pat || body.apellido_mat) {
        mondayFields.nombre = `${data.nombre} ${data.apellido_pat} ${data.apellido_mat}`
      }

      if (Object.keys(mondayFields).length > 0) {
        updateMondayItem(data.monday_item_id, mondayFields).catch((e) =>
          console.error('Monday sync error:', e)
        )
      }
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar solicitud' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar solicitud' }, { status: 500 })
  }
}
