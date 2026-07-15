import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


// Résiliation en libre-service : programme l'arrêt à la fin de la période en cours
// (donc à la fin de l'essai gratuit si on est encore en essai — aucun prélèvement n'aura lieu),
// plutôt qu'une coupure immédiate qui priverait le restaurant de ce qu'il a déjà payé
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = getSupabaseAdmin()
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const slug = user.id.slice(0, 8)
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('stripe_subscription_id')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!restaurant?.stripe_subscription_id) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé' }, { status: 404 })
    }

    const subscription = await stripe.subscriptions.update(restaurant.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    const finPeriode = subscription.items?.data?.[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null

    await supabase
      .from('restaurants')
      .update({ resiliation_prevue: true, fin_periode_actuelle: finPeriode })
      .eq('slug', slug)

    return NextResponse.json({ success: true, finPeriode })
  } catch (err: any) {
    console.error('Erreur cancel-subscription:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
