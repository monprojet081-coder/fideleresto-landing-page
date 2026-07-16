import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getResend } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fideleresto.fr'

// Réglages de la campagne : combien par lot, plafond quotidien, plage horaire autorisée
const TAILLE_LOT = 12
const PLAFOND_QUOTIDIEN = 144
const HEURE_DEBUT = 8   // 8h heure de Paris
const HEURE_FIN = 20    // 20h heure de Paris

// Déclenchée par un pinger externe (cron-job.org ou équivalent) toutes les heures, car le
// plan Vercel Hobby ne permet pas de cron interne plus fréquent qu'une fois par jour.
// La route se protège elle-même : hors plage horaire ou plafond du jour atteint, elle ne
// fait rien plutôt que de compter sur le déclencheur pour respecter le rythme.
export async function GET(req: NextRequest) {
  const resend = getResend()
  const supabaseAdmin = getSupabaseAdmin()

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const maintenantParis = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', hour: 'numeric', hour12: false })
    const heureActuelle = parseInt(maintenantParis)

    if (heureActuelle < HEURE_DEBUT || heureActuelle >= HEURE_FIN) {
      return NextResponse.json({ success: true, ignore: 'hors plage horaire', heureActuelle })
    }

    // Début de journée à Paris, en UTC, pour compter les envois d'aujourd'hui seulement
    const debutJourISO = new Date(new Date().toLocaleDateString('en-US', { timeZone: 'Europe/Paris' })).toISOString()

    const { count: envoyesAujourdhui } = await supabaseAdmin
      .from('prospects')
      .select('id', { count: 'exact', head: true })
      .eq('statut', 'envoye')
      .gte('updated_at', debutJourISO)

    if ((envoyesAujourdhui || 0) >= PLAFOND_QUOTIDIEN) {
      return NextResponse.json({ success: true, ignore: 'plafond quotidien atteint', envoyesAujourdhui })
    }

    const placesRestantes = PLAFOND_QUOTIDIEN - (envoyesAujourdhui || 0)
    const taille = Math.min(TAILLE_LOT, placesRestantes)

    const { data: lot, error: lotError } = await supabaseAdmin
      .from('prospects')
      .select('id, nom, email, sujet_email, corps_email')
      .eq('statut', 'a_contacter')
      .not('sujet_email', 'is', null)
      .not('corps_email', 'is', null)
      .order('created_at', { ascending: true })
      .limit(taille)

    if (lotError) throw lotError
    if (!lot || lot.length === 0) {
      return NextResponse.json({ success: true, ignore: 'aucun contact restant à envoyer' })
    }

    let envoyes = 0
    const erreurs: any[] = []

    for (const prospect of lot) {
      const lienDesabonnement = `${SITE_URL}/api/prospection/desabonner?id=${prospect.id}`

      const corpsHtml = (prospect.corps_email || '')
        .split(/\n{2,}/)
        .map((paragraphe: string) => `<p style="margin: 0 0 16px;">${paragraphe.replace(/\n/g, '<br/>')}</p>`)
        .join('')

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #241914; line-height: 1.5;">
          ${corpsHtml}
          <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            FidèleResto — <a href="${SITE_URL}" style="color: #9ca3af;">fideleresto.fr</a><br/>
            <a href="${lienDesabonnement}" style="color: #9ca3af;">Se désinscrire de ces emails</a>
          </p>
        </div>
      `

      const { error: sendError } = await resend.emails.send({
        from: 'FidèleResto <contact@fideleresto.fr>',
        to: [prospect.email],
        subject: prospect.sujet_email,
        html,
      })

      if (sendError) {
        erreurs.push({ email: prospect.email, error: sendError })
        continue
      }

      await supabaseAdmin
        .from('prospects')
        .update({ statut: 'envoye', updated_at: new Date().toISOString() })
        .eq('id', prospect.id)

      envoyes++
    }

    return NextResponse.json({ success: true, envoyes, erreurs })
  } catch (err: any) {
    console.error('Erreur cron prospection:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
