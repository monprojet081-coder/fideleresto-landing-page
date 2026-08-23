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

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user || !estAdmin(user.email)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const septJoursAvant = new Date()
    septJoursAvant.setDate(septJoursAvant.getDate() - 7)

    const { data: erreurs, error } = await supabaseAdmin
      .from('checkout_erreurs')
      .select('id, slug, plan, message, created_at')
      .gte('created_at', septJoursAvant.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ erreurs: erreurs || [] })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
