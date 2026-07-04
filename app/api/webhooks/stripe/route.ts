import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Signature webhook invalide:', err.message)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // Le paiement initial est confirmé : on active le plan choisi
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const slug = session.client_reference_id
        const plan = session.metadata?.plan?.startsWith('premium') ? 'premium' : 'standard'

        if (slug) {
          await supabase
            .from('restaurants')
            .update({
              plan,
              statut_abonnement: 'actif',
              stripe_customer_id: session.customer as string,
            })
            .eq('slug', slug)
        }
        break
      }

      // L'abonnement est modifié (changement de plan, relance après échec de paiement résolue...)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const slug = subscription.metadata?.slug
        const plan = subscription.metadata?.plan?.startsWith('premium') ? 'premium' : 'standard'

        if (slug) {
          const statut =
            subscription.status === 'active' ? 'actif' :
            subscription.status === 'past_due' ? 'impaye' :
            'annule'

          await supabase
            .from('restaurants')
            .update({ plan, statut_abonnement: statut })
            .eq('slug', slug)
        }
        break
      }

      // L'abonnement est résilié (fin de période ou annulation immédiate)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const slug = subscription.metadata?.slug

        if (slug) {
          await supabase
            .from('restaurants')
            .update({ plan: null, statut_abonnement: 'annule' })
            .eq('slug', slug)
        }
        break
      }

      // Un prélèvement a échoué (carte expirée, fonds insuffisants...)
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('restaurants')
          .update({ statut_abonnement: 'impaye' })
          .eq('stripe_customer_id', customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Erreur traitement webhook:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
