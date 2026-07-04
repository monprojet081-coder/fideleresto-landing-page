import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, STRIPE_PRICES, PlanKey } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json() as { userId: string; plan: PlanKey }

    if (!userId || !plan || !STRIPE_PRICES[plan]) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const slug = userId.slice(0, 8)

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
    }

    const { data: userData } = await supabase.auth.admin.getUserById(restaurant.user_id)

    const origin = req.headers.get('origin') || 'https://fideleresto-landing-page-9dhz.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
      // On garde une trace du restaurant concerné : récupéré dans le webhook
      // pour savoir quel restaurant mettre à jour une fois le paiement confirmé
      client_reference_id: slug,
      customer_email: restaurant.stripe_customer_id ? undefined : userData?.user?.email,
      metadata: { slug, plan },
      subscription_data: { metadata: { slug, plan } },
      success_url: `${origin}/dashboard?abonnement=succes`,
      cancel_url: `${origin}/dashboard?abonnement=annule`,
      // Si le restaurant a déjà un client Stripe (résilié puis reparti par ex.), on le réutilise
      customer: restaurant.stripe_customer_id || undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Erreur create-checkout-session:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
