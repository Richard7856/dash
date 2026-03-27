import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('operadores')
      .select('id, nombre_completo, proyecto, sucursal, ciudad, fecha_alta')
      .ilike('nombre_completo', `%${q}%`)
      .eq('estado', 'ACTIVO')
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al buscar operadores' }, { status: 500 })
  }
}
