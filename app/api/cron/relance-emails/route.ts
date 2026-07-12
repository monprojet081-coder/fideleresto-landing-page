import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = 'https://fideleresto-landing-page-9dhz.vercel.app'

export async function GET(req: NextRequest) {
  // Vérifie que l'appel vient bien de Vercel Cron (et pas de n'importe qui sur internet)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { data: restaurants, error: restoError } = await supabaseAdmin
      .from('restaurants')
      .select('slug, nom_restaurant, relance_active, relance_jours_inactivite, relance_pourcentage')
      .eq('relance_active', true)

    if (restoError) throw restoError

    let totalEnvoyes = 0
    const details: any[] = []

    for (const resto of restaurants || []) {
      const jours = resto.relance_jours_inactivite || 10
      const seuil = new Date(Date.now() - jours * 24 * 60 * 60 * 1000).toISOString()

      // Tous les passages de ce restaurant, du plus récent au plus ancien
      const { data: passages } = await supabaseAdmin
        .from('clients')
        .select('id, prenom, email, created_at, consentement_marketing, relance_envoyee')
        .eq('restaurant_slug', resto.slug)
        .order('created_at', { ascending: false })

      if (!passages) continue

      // On ne garde que le passage le plus récent par email (= sa dernière visite)
      const dernierPassageParEmail = new Map<string, typeof passages[number]>()
      for (const p of passages) {
        if (!dernierPassageParEmail.has(p.email)) {
          dernierPassageParEmail.set(p.email, p)
        }
      }

      for (const passage of dernierPassageParEmail.values()) {
        const inactifDepuisAssezLongtemps = passage.created_at <= seuil
        if (
          inactifDepuisAssezLongtemps &&
          passage.consentement_marketing &&
          !passage.relance_envoyee
        ) {
          const lienRoue = `${SITE_URL}/r/${resto.slug}`
          const lienDesabonnement = `${SITE_URL}/api/relance/desabonner?email=${encodeURIComponent(passage.email)}&slug=${resto.slug}`

          const { error: sendError } = await resend.emails.send({
            from: 'FidèleResto <contact@fideleresto.fr>',
            to: [passage.email],
            subject: `${passage.prenom}, on ne vous a pas vu depuis un moment 👋`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #241914;">
                <h1 style="color: #6b1e2e; text-align: center;">On vous attend chez ${resto.nom_restaurant} !</h1>
                <p style="font-size: 16px;">Bonjour ${passage.prenom},</p>
                <p>Ça fait un moment qu'on ne vous a pas vu. Pour vous donner envie de revenir, voici <strong>${resto.relance_pourcentage}% de réduction</strong> sur votre prochaine visite :</p>
                <div style="background: #faf3e8; border: 2px dashed #6b1e2e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <p style="font-size: 28px; font-weight: bold; color: #6b1e2e; margin: 0;">-${resto.relance_pourcentage}%</p>
                  <p style="font-size: 13px; color: #241914; margin: 4px 0 0;">Présentez cet email sur place</p>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${lienRoue}" style="background: #6b1e2e; color: #faf3e8; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Rejouer à la roue</a>
                </div>
                <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                  Vous recevez cet email car vous avez accepté de recevoir des offres de ce restaurant.
                  <a href="${lienDesabonnement}" style="color: #9ca3af;">Se désinscrire</a>
                </p>
              </div>
            `,
          })

          if (!sendError) {
            await supabaseAdmin
              .from('clients')
              .update({ relance_envoyee: true })
              .eq('id', passage.id)
            totalEnvoyes++
            details.push({ restaurant: resto.slug, email: passage.email })
          }
        }
      }
    }

    return NextResponse.json({ success: true, totalEnvoyes, details })
  } catch (err: any) {
    console.error('Erreur cron relance:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
