import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const solicitudId = formData.get('solicitud_id') as string

    if (!file || !solicitudId) {
      return NextResponse.json({ error: 'Archivo y solicitud_id requeridos' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${solicitudId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('evidencias')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('evidencias').getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('evidencias_pago')
      .insert({
        solicitud_id: solicitudId,
        url: urlData.publicUrl,
        filename: file.name,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al subir evidencia' }, { status: 500 })
  }
}
