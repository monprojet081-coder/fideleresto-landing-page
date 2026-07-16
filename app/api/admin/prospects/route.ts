import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

function estAdmin(email: string | undefined | null) {
  if (!email) return false
  const listeAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return listeAdmins.includes(email.toLowerCase())
}

async function verifierAdmin(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user || !estAdmin(user.email)) return null
  return supabaseAdmin
}

// Liste tous les prospects (contacts de démarchage), du plus récent au plus ancien
export async function GET(req: NextRequest) {
  const supabaseAdmin = await verifierAdmin(req)
  if (!supabaseAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prospects: data })
}

// Ajoute un nouveau prospect
export async function POST(req: NextRequest) {
  const supabaseAdmin = await verifierAdmin(req)
  if (!supabaseAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { nom, email, telephone, ville } = await req.json()
  if (!nom || !email) {
    return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('prospects')
    .insert([{ nom, email, telephone: telephone || null, ville: ville || null, statut: 'a_contacter' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prospect: data })
}

// Met à jour le statut et/ou les notes d'un prospect
export async function PATCH(req: NextRequest) {
  const supabaseAdmin = await verifierAdmin(req)
  if (!supabaseAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id, statut, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 })

  const misAJour: Record<string, any> = { updated_at: new Date().toISOString() }
  if (statut !== undefined) misAJour.statut = statut
  if (notes !== undefined) misAJour.notes = notes

  const { data, error } = await supabaseAdmin
    .from('prospects')
    .update(misAJour)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prospect: data })
}

// Supprime un prospect
export async function DELETE(req: NextRequest) {
  const supabaseAdmin = await verifierAdmin(req)
  if (!supabaseAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'Identifiant manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.from('prospects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
