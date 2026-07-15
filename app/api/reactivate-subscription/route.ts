import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


// Annule une résiliation programmée (le restaurant a changé d'avis avant la fin de sa période)
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

    await stripe.subscriptions.update(restaurant.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    await supabase
      .from('restaurants')
      .update({ resiliation_prevue: false })
      .eq('slug', slug)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erreur reactivate-subscription:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
