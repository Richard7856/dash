import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchAllOperadoresFromMonday } from '@/lib/monday'

// Upsert operadores from Monday PLANTILLA board into Supabase
export async function POST() {
  try {
    const supabase = await createServerSupabase()

    // Auth check — only logged-in admins can trigger sync
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return await runSync(supabase)
  } catch (e) {
    console.error('Sync operadores error:', e)
    return NextResponse.json({ error: 'Error en sync' }, { status: 500 })
  }
}

// Also support GET with a secret key for cron jobs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  // Allow cron access with a simple shared secret, or skip auth in dev
  if (key !== process.env.SYNC_SECRET_KEY && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    // Use service role for cron — no user session available
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    return await runSync(supabase)
  } catch (e) {
    console.error('Sync operadores cron error:', e)
    return NextResponse.json({ error: 'Error en sync' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runSync(supabase: any) {
  const mondayOps = await fetchAllOperadoresFromMonday()

  if (mondayOps.length === 0) {
    return NextResponse.json({ message: 'No se encontraron operadores en Monday', synced: 0 })
  }

  let upserted = 0
  let errors = 0

  // Process in batches of 50 to avoid overwhelming Supabase
  const batchSize = 50
  for (let i = 0; i < mondayOps.length; i += batchSize) {
    const batch = mondayOps.slice(i, i + batchSize)

    const rows = batch
      .filter(op => op.id) // Skip items without an ID
      .map(op => ({
        id: op.id,
        nombre_completo: op.nombre_completo,
        sucursal: op.sucursal || null,
        proyecto: op.proyecto || null,
        ciudad: op.ciudad || null,
        estado: op.estado || null,
        imss: op.imss || null,
        fecha_alta: op.fecha_alta || null,
        fecha_baja: op.fecha_baja || null,
        monday_item_id: op.monday_item_id,
        updated_at: new Date().toISOString(),
      }))

    if (rows.length === 0) continue

    const { error } = await supabase
      .from('operadores')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      console.error('Upsert batch error:', error.message)
      errors++
    } else {
      upserted += rows.length
    }
  }

  return NextResponse.json({
    message: `Sync completado: ${upserted} operadores actualizados`,
    total_monday: mondayOps.length,
    synced: upserted,
    errors,
  })
}
