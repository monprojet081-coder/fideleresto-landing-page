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
  const supabase = getSupabaseAdmin()
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user || !estAdmin(user.email)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const debut24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const debut7j = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const debut30j = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      visites24h, visites7j, visites30j,
      connexionsReussies7j, connexionsEchouees7j,
      restaurants, clientsTotal,
      inscriptionsSemaine,
    ] = await Promise.all([
      supabase.from('visites').select('id', { count: 'exact', head: true }).gte('created_at', debut24h),
      supabase.from('visites').select('id', { count: 'exact', head: true }).gte('created_at', debut7j),
      supabase.from('visites').select('id', { count: 'exact', head: true }).gte('created_at', debut30j),
      supabase.from('connexion_tentatives').select('id', { count: 'exact', head: true }).gte('created_at', debut7j).eq('succes', true),
      supabase.from('connexion_tentatives').select('id', { count: 'exact', head: true }).gte('created_at', debut7j).eq('succes', false),
      supabase.from('restaurants').select('plan, statut_abonnement'),
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('restaurants').select('id', { count: 'exact', head: true }).gte('created_at', debut7j),
    ])

    const listeRestaurants = restaurants.data || []
    const parPlan: Record<string, number> = {}
    const parStatut: Record<string, number> = {}
    for (const r of listeRestaurants) {
      const plan = r.plan || 'aucun'
      const statut = r.statut_abonnement || 'aucun'
      parPlan[plan] = (parPlan[plan] || 0) + 1
      parStatut[statut] = (parStatut[statut] || 0) + 1
    }

    return NextResponse.json({
      visites: { j1: visites24h.count || 0, j7: visites7j.count || 0, j30: visites30j.count || 0 },
      connexions: { reussies7j: connexionsReussies7j.count || 0, echouees7j: connexionsEchouees7j.count || 0 },
      restaurants: { total: listeRestaurants.length, parPlan, parStatut, inscriptionsSemaine: inscriptionsSemaine.count || 0 },
      clientsTotal: clientsTotal.count || 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur : ' + err.message }, { status: 500 })
  }
}
