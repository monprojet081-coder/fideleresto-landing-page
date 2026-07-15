import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getStripe, STRIPE_PRICE_FRAIS_SITE, STRIPE_PRICE_FRAIS_RESEAUX } from '@/lib/stripe'
import type Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'


const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const stripe = getStripe()
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
      // Le paiement initial est confirmé (ou la période d'essai démarre) : on active le plan choisi
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const slug = session.client_reference_id
        const plan = session.metadata?.plan?.startsWith('premium') ? 'premium' : 'standard'

        if (slug) {
          let statut = 'actif'
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            statut = subscription.status === 'trialing' ? 'essai' : 'actif'
          }

          // Mise à jour critique en premier, séparée du reste : le statut d'abonnement ne doit
          // jamais rester bloqué à cause d'une colonne optionnelle manquante plus bas
          const { error: erreurCritique } = await supabase
            .from('restaurants')
            .update({
              plan,
              statut_abonnement: statut,
              stripe_customer_id: session.customer as string,
            })
            .eq('slug', slug)

          if (erreurCritique) {
            console.error('Erreur mise à jour critique restaurants (plan/statut):', erreurCritique.message)
          }

          // On regarde le détail des lignes payées pour savoir si le client a pris
          // l'option création de site et/ou gestion des réseaux sociaux
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })
          const priceIds = lineItems.data.map((item) => item.price?.id)
          const aPrisSite = priceIds.includes(STRIPE_PRICE_FRAIS_SITE)
          const aPrisReseaux = priceIds.includes(STRIPE_PRICE_FRAIS_RESEAUX)

          const misAJourOptions: Record<string, any> = {
            stripe_subscription_id: session.subscription as string || null,
          }
          if (aPrisSite) misAJourOptions.option_site = true
          if (aPrisReseaux) misAJourOptions.option_reseaux = true

          const { data: resto, error: erreurOptions } = await supabase
            .from('restaurants')
            .update(misAJourOptions)
            .eq('slug', slug)
            .select('nom_restaurant')
            .maybeSingle()

          if (erreurOptions) {
            console.error('Erreur mise à jour options restaurants (non bloquant):', erreurOptions.message)
          }

          // Notifie l'équipe par email si une option a été prise, pour savoir qu'il faut
          // s'occuper du site ou des réseaux sociaux du restaurant
          if ((aPrisSite || aPrisReseaux) && process.env.ADMIN_EMAILS) {
            const destinataires = process.env.ADMIN_EMAILS.split(',').map((e) => e.trim()).filter(Boolean)
            const options = [aPrisSite && 'création de site', aPrisReseaux && 'gestion des réseaux sociaux']
              .filter(Boolean)
              .join(' + ')

            if (destinataires.length > 0) {
              await resend.emails.send({
                from: 'FidèleResto <contact@fideleresto.fr>',
                to: destinataires,
                subject: `🔔 Nouvelle option souscrite : ${options}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #6b1e2e;">Nouvelle option à traiter</h1>
                    <p><strong>${resto?.nom_restaurant || 'Un restaurant'}</strong> (slug : ${slug}) vient de souscrire :</p>
                    <p style="font-size: 18px; font-weight: bold;">${options}</p>
                    <p>Rendez-vous dans l'espace admin pour voir les coordonnées du restaurant et le contacter.</p>
                  </div>
                `,
              }).catch((err) => console.error('Erreur envoi email notification option:', err))
            }
          }
        }
        break
      }

      // L'abonnement est modifié (changement de plan, fin d'essai, relance après échec de paiement résolue,
      // demande de résiliation programmée ou annulation de cette demande...)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const slug = subscription.metadata?.slug
        const plan = subscription.metadata?.plan?.startsWith('premium') ? 'premium' : 'standard'

        if (slug) {
          const statut =
            subscription.status === 'trialing' ? 'essai' :
            subscription.status === 'active' ? 'actif' :
            subscription.status === 'past_due' ? 'impaye' :
            'annule'

          const { error: erreurCritique } = await supabase
            .from('restaurants')
            .update({ plan, statut_abonnement: statut })
            .eq('slug', slug)

          if (erreurCritique) {
            console.error('Erreur mise à jour critique restaurants (plan/statut):', erreurCritique.message)
          }

          const finPeriode = subscription.items?.data?.[0]?.current_period_end
            ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
            : null

          const { error: erreurResiliation } = await supabase
            .from('restaurants')
            .update({
              resiliation_prevue: subscription.cancel_at_period_end,
              fin_periode_actuelle: finPeriode,
            })
            .eq('slug', slug)

          if (erreurResiliation) {
            console.error('Erreur mise à jour résiliation restaurants (non bloquant):', erreurResiliation.message)
          }
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
            .update({ plan: null, statut_abonnement: 'annule', resiliation_prevue: false, fin_periode_actuelle: null })
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
