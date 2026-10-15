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

    const { data: restaurants, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, user_id, slug, nom_restaurant, plan, statut_abonnement, option_site, telephone, ville, parrain, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // On récupère l'email de chaque restaurateur
    const restaurantsAvecEmail = await Promise.all(
      (restaurants || []).map(async (r) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(r.user_id)
        return { ...r, email: data?.user?.email || null }
      })
    )

    return NextResponse.json({ restaurants: restaurantsAvecEmail })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}

// Activer / desactiver un compte SANS paiement (compte de demonstration, partenaire, geste commercial).
// Reserve aux administrateurs (ADMIN_EMAILS).
export async function PATCH(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user || !estAdmin(user.email)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    const { id, plan, actif } = await req.json()
    if (!id || (actif && !['essentiel', 'standard'].includes(plan))) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }
    const maj = actif
      ? { plan, statut_abonnement: 'actif', resiliation_prevue: false, fin_periode_actuelle: null }
      : { plan: null, statut_abonnement: 'annule', resiliation_prevue: false, fin_periode_actuelle: null }
    const { error } = await supabaseAdmin.from('restaurants').update(maj).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, ...maj })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
