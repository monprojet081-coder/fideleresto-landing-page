import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import {
  getStripe,
  STRIPE_PRICES,
  STRIPE_PRICE_FRAIS_SITE,
  STRIPE_PRICE_MAINTENANCE_SITE,
  STRIPE_PRICE_FRAIS_RESEAUX,
  STRIPE_PRICE_GESTION_RESEAUX,
  PlanKey,
  periodeDuPlan,
} from '@/lib/stripe'


export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const stripe = getStripe()
  try {
    const { userId, plan, avecCreationSite, avecReseaux } = await req.json() as {
      userId: string
      plan: PlanKey
      avecCreationSite?: boolean
      avecReseaux?: boolean
    }

    if (!userId || !plan || !STRIPE_PRICES[plan]) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const slug = userId.slice(0, 8)

    let { data: restaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    const { data: userData } = await supabase.auth.admin.getUserById(userId)

    if (!restaurant) {
      const { data: newResto, error: erreurInsert } = await supabase
        .from('restaurants')
        .insert([{
          user_id: userId,
          slug,
          nom_restaurant: userData?.user?.user_metadata?.nom_restaurant || 'Mon Restaurant',
          google_avis_url: userData?.user?.user_metadata?.google_avis_url || null,
          telephone: userData?.user?.user_metadata?.telephone || null,
          ville: userData?.user?.user_metadata?.ville || null,
          scan_qr: 0,
        }])
        .select()
        .single()
      if (erreurInsert) {
        console.error('Erreur création restaurant (create-checkout-session):', erreurInsert.message)
      }
      restaurant = newResto
    }

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://fideleresto-landing-page-9dhz.vercel.app'

    // On s'assure que le client Stripe a un nom (celui du restaurant), pas juste un email :
    // sans ça, les factures Stripe n'affichent qu'une adresse email comme identification client.
    let customerId = restaurant.stripe_customer_id as string | null
    if (!customerId) {
      const nouveauClient = await stripe.customers.create({
        email: userData?.user?.email,
        name: restaurant.nom_restaurant || undefined,
        metadata: { slug },
      })
      customerId = nouveauClient.id

      // Sauvegardé tout de suite (pas seulement dans le webhook après paiement) pour éviter
      // de recréer un nouveau client Stripe à chaque tentative si le premier essai est abandonné
      const { error: erreurCustomerId } = await supabase
        .from('restaurants')
        .update({ stripe_customer_id: customerId })
        .eq('slug', slug)
      if (erreurCustomerId) {
        console.error('Erreur sauvegarde stripe_customer_id (non bloquant):', erreurCustomerId.message)
      }
    }

    const lineItems: { price: string; quantity: number }[] = [
      { price: STRIPE_PRICES[plan], quantity: 1 },
    ]

    // Options (création de site, gestion réseaux) : uniquement sur le Premium, mais
    // maintenant disponibles quel que soit le rythme (mensuel/trimestriel/annuel) —
    // l'abonnement de suivi (maintenance/gestion) est facturé au même rythme que le plan
    // principal, pour ne pas mélanger deux fréquences différentes dans un seul abonnement Stripe
    const periode = periodeDuPlan(plan)
    const optionsDisponibles = plan.startsWith('premium')

    if (optionsDisponibles && avecCreationSite) {
      lineItems.push({ price: STRIPE_PRICE_FRAIS_SITE, quantity: 1 })
      lineItems.push({ price: STRIPE_PRICE_MAINTENANCE_SITE[periode], quantity: 1 })
    }

    if (optionsDisponibles && avecReseaux) {
      lineItems.push({ price: STRIPE_PRICE_FRAIS_RESEAUX, quantity: 1 })
      lineItems.push({ price: STRIPE_PRICE_GESTION_RESEAUX[periode], quantity: 1 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      // On garde une trace du restaurant concerné : récupéré dans le webhook
      // pour savoir quel restaurant mettre à jour une fois le paiement confirmé
      client_reference_id: slug,
      metadata: { slug, plan },
      subscription_data: {
        metadata: { slug, plan },
        // 14 jours gratuits, uniquement sur le plan Standard
        ...(plan.startsWith('standard') ? { trial_period_days: 14 } : {}),
      },
      success_url: `${origin}/dashboard?abonnement=succes`,
      cancel_url: `${origin}/dashboard?abonnement=annule`,
      customer: customerId,
      // Langue fixée en français : tous les clients sont des restaurateurs français,
      // pas la peine de laisser ça dépendre de la langue du navigateur de chacun
      locale: 'fr',
      // Adresse de facturation obligatoire : elle apparaît sur les factures et évite
      // les rejets de finalisation si Stripe Tax est activé un jour
      billing_address_collection: 'required',
      // Si le client existait déjà, on garde son adresse à jour avec celle saisie au paiement
      customer_update: { address: 'auto' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Erreur create-checkout-session:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
